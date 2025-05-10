#!/bin/bash

# Start generating TypeScript types for your Supabase schema
echo "Generating TypeScript types for your Supabase schema..."

# Generate TypeScript types for your Supabase schema
npx supabase gen types --lang=typescript \
  --project-id jqovxmsueffhddmyqcew \
  --schema public > types/supabase.ts

# Check if the generation was successful
if [ $? -eq 0 ]; then
  echo "TypeScript types generated successfully."
else
  echo "Failed to generate TypeScript types." >&2
  exit 1
fi
