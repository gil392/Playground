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

# Step 1: Extract all test names using Node.js
echo "🔍 Extracting test names from: $SUITE_FILE"

readarray -t TEST_NAMES < <(node -e "
  const fs = require('fs');
  const file = fs.readFileSync('$SUITE_FILE', 'utf-8');
  const regex = /(test|it)\(\s*['\"\`](.*?)['\"\`]/g;
  const matches = [...file.matchAll(regex)];
  for (const match of matches) console.log(match[2]);
")

if [[ ${#TEST_NAMES[@]} -eq 0 ]]; then
  echo "❌ No tests found in file."
  exit 1
fi

echo -e "\n🧪 Found ${#TEST_NAMES[@]} tests:"
printf '  • %s\n' "${TEST_NAMES[@]}"

# Prepare output files
DETAILED_FILE="./dist/bisect/bisect_all_tests_detailed_log.txt"
SUMMARY_FILE="./dist/bisect/bisect_all_tests_summary.txt"
> "$DETAILED_FILE"
> "$SUMMARY_FILE"

# Step 2: Run bisect for each test
for test_name in "${TEST_NAMES[@]}"; do
  echo -e "\n🔍 Starting bisect for: \"$test_name\""
  git bisect start "$BAD_COMMIT" "$GOOD_COMMIT"

  # Create test runner that exits with Jest's actual result
  RUNNER_SCRIPT="/tmp/bisect_runner.sh"
  cat <<EOF > "$RUNNER_SCRIPT"
#!/bin/bash
echo "Running test: $test_name"
npx jest --detectOpenHandles --forceExit --runInBand "$SUITE_FILE" -t "$test_name"
exit \$?
EOF

  chmod +x "$RUNNER_SCRIPT"

  echo -e "\n🧪 START: $test_name\n" >> "$DETAILED_FILE"
  git bisect run "$RUNNER_SCRIPT" >> "$DETAILED_FILE" 2>&1

  # Find the first bad commit from the bisect output
BISECT_RESULT=$(grep 'is the first bad commit' "$DETAILED_FILE" | tail -n1 | grep -oE '^[0-9a-f]{7,40}')
    TEST_LINE="[$test_name] failed first in commit $BISECT_RESULT"

  echo "$TEST_LINE" >> "$SUMMARY_FILE"
  echo "✅ Done: $TEST_LINE"

  git bisect reset
done

# Final results
echo -e "\n📄 Detailed results saved to: $DETAILED_FILE"
echo -e "📄 Summary results saved to: $SUMMARY_FILE"
echo "✅ All bisects finished!"
