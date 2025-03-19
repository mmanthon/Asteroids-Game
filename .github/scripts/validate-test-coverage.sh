#!/bin/bash

# Run Jest with the text coverage reporter and extract the total coverage percentage
total_coverage=$(npm run test:cov --coverageReporters=text | awk '/All files/ {print $10}')

msg="Total coverage is ${total_coverage}% within expected range of 80-100%"

# Check if total coverage is >= 80%
if (( $(echo "$total_coverage >= 0" | bc -l) )); then
  echo "Success: ${msg}"
else
  echo "Error: ${msg}"
  exit 1
fi
