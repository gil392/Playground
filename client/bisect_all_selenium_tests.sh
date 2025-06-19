#!/bin/bash

BAD_COMMIT=$1
GOOD_COMMIT=$2
TEST_DIR=$3 # e.g. ./tests

if [[ -z "$BAD_COMMIT" || -z "$GOOD_COMMIT" || -z "$TEST_DIR" ]]; then
  echo "Usage: $0 <bad_commit> <good_commit> <test_dir>"
  exit 1
fi

echo "🔍 Looking for Selenium test files in $TEST_DIR"
TEST_FILES=($(find "$TEST_DIR" -name "*.test.ts"))

if [[ ${#TEST_FILES[@]} -eq 0 ]]; then
  echo "❌ No test files found."
  exit 1
fi

echo -e "\n🧪 Found ${#TEST_FILES[@]} tests:"
for test in "${TEST_FILES[@]}"; do echo "  • $test"; done

DETAILED_FILE="./dist/bisect/selenium_bisect_detailed.txt"
SUMMARY_FILE="./dist/bisect/selenium_bisect_summary.txt"
mkdir -p ./dist/bisect
> "$DETAILED_FILE"
> "$SUMMARY_FILE"

for test_file in "${TEST_FILES[@]}"; do
  test_name=$(basename "$test_file")
  echo -e "\n🔍 Starting bisect for: \"$test_name\""
  git bisect start "$BAD_COMMIT" "$GOOD_COMMIT"

  # Create runner script
  RUNNER_SCRIPT="/tmp/bisect_runner.sh"
  cat <<EOF > "$RUNNER_SCRIPT"
#!/bin/bash
echo "▶️ Running test: $test_name"
npx ts-node "$test_file"
EOF

  chmod +x "$RUNNER_SCRIPT"

  echo -e "\n🧪 START: $test_name\n" >> "$DETAILED_FILE"
  git bisect run "$RUNNER_SCRIPT" >> "$DETAILED_FILE" 2>&1

  BISECT_RESULT=$(grep 'is the first bad commit' "$DETAILED_FILE" | tail -n1 | grep -oE '^[0-9a-f]{7,40}')
  echo "[$test_name] failed first in commit $BISECT_RESULT" >> "$SUMMARY_FILE"
  echo "✅ Done: $test_name → $BISECT_RESULT"

  git bisect reset
done

echo -e "\n📄 Detailed log: $DETAILED_FILE"
echo -e "📄 Summary log:  $SUMMARY_FILE"
echo "✅ All bisects complete."
