#!/bin/bash

# This file allows us to create schema validators that run in our frontend code.
# We need this to feed into both monoaco editor for course files view and code mirror for mdx editor
# When you make a change to any of the following main types for an activity, or add a new activity,
# You should regenerate the schema
# To add a new schema, add the file as the key and the type name as the value in the TYPE_MAP variable

set -e  # Exit on any error
set -o pipefail

# Define base paths
TSCONFIG="libs/types/cmi5/tsconfig.lib.json"
SCHEMA_DIR="libs/types/cmi5/src/schemas"

# Define mappings: [filename]="TypeName"
declare -A TYPE_MAP=(
  ["download.ts"]="DownloadFilesContent"
  ["quiz.ts"]="QuizContent"
  ["slide.ts"]="RC5ScenarioContent"
  ["ctf.ts"]="CTFContent"
  ["jobe.ts"]="JobeContent"
  ["course.ts"]="CourseData"

)

echo "🛠  Generating JSON Schemas..."

for FILE in "${!TYPE_MAP[@]}"; do
  TYPE="${TYPE_MAP[$FILE]}"
  INPUT_PATH="libs/types/cmi5/src/lib/$FILE"
  OUTPUT_PATH="$SCHEMA_DIR/${TYPE}.schema.json"

  echo "🔄 Generating schema for type '$TYPE' from '$INPUT_PATH'..."
  npx ts-json-schema-generator \
    --path "$INPUT_PATH" \
    --type "$TYPE" \
    --tsconfig "$TSCONFIG" \
    --out "$OUTPUT_PATH" 

  echo "✅ Schema written to $OUTPUT_PATH"
done

echo "🎉 All schemas generated successfully."
