#!/bin/bash

# Usage:
# ./bisect_all_tests_in_suite.sh <bad_commit> <good_commit> <test_suite_file>

BAD_COMMIT=$1
GOOD_COMMIT=$2
SUITE_FILE=$3

if [[ -z "$BAD_COMMIT" || -z "$GOOD_COMMIT" || -z "$SUITE_FILE" ]]; then
  echo "Usage: $0 <bad_commit> <good_commit> <test_suite_file>"
  exit 1
fi

echo "🔍 Running full suite once to detect failing tests..."
npm run test -- "$SUITE_FILE" --json --outputFile=jest-results.json > /dev/null

if [[ ! -f jest-results.json ]]; then
  echo "❌ Failed to produce test results"
  exit 1
fi

readarray -t FAILED_TEST_NAMES < <(node -e '
  const data = require("./jest-results.json");
  const failed = data.testResults.flatMap(tr =>
    tr.assertionResults
      .filter(ar => ar.status === "failed")
      .map(ar => ar.title)
  );
  for (const name of failed) console.log(name);
')

if [[ ${#FAILED_TEST_NAMES[@]} -eq 0 ]]; then
  echo "✅ No failing tests in current commit."
  exit 0
fi

echo -e "\n❌ Found ${#FAILED_TEST_NAMES[@]} failing tests:"
printf '  • %s\n' "${FAILED_TEST_NAMES[@]}"

# Prepare output files
DETAILED_FILE="./dist/bisect/bisect_all_tests_detailed_log.txt"
SUMMARY_FILE="./dist/bisect/bisect_all_tests_summary.txt"
> "$DETAILED_FILE"
> "$SUMMARY_FILE"

# Step 2: Run bisect for each test
for test_name in "${FAILED_TEST_NAMES[@]}"; do
  echo -e "\n🔍 Starting bisect for: \"$test_name\""
  git bisect start "$BAD_COMMIT" "$GOOD_COMMIT"

  # Create test runner that exits with Jest's actual result
  RUNNER_SCRIPT="/tmp/bisect_runner.sh"
  cat <<EOF > "$RUNNER_SCRIPT"
#!/bin/bash
echo "Running test: $test_name"
npx jest --detectOpenHandles --forceExit --runInBand "$SUITE_FILE" -t "$test_name"
node -e '
  const data = require("./jest-bisect-result.json");
  const results = data.testResults.flatMap(tr => tr.assertionResults);
  const failed = results.find(t => t.title === "$test_name" && t.status === "failed");
  process.exit(failed ? 1 : 0);
'
EOF

  chmod +x "$RUNNER_SCRIPT"

TEMP_LOG="./dist/bisect/bisect_${test_name// /_}_log.txt"
> "$TEMP_LOG"

echo -e "\n🧪 START: $test_name\n" >> "$TEMP_LOG"
git bisect run "$RUNNER_SCRIPT" >> "$TEMP_LOG" 2>&1
cat "$TEMP_LOG" >> "$DETAILED_FILE"

  # Find the first bad commit from the bisect output
  BISECT_RESULT=$(grep 'is the first bad commit' "$TEMP_LOG" | tail -n1 | grep -oE '^[0-9a-f]{7,40}')
    TEST_LINE="[$test_name] failed first in commit $BISECT_RESULT"

  echo "$TEST_LINE" >> "$SUMMARY_FILE"
  echo "✅ Done: $TEST_LINE"

  git bisect reset
done

# Final results
echo -e "\n📄 Detailed results saved to: $DETAILED_FILE"
echo -e "📄 Summary results saved to: $SUMMARY_FILE"
echo "✅ All bisects finished!"
