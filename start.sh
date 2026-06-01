#!/bin/bash

module=$1

if [ -z "$module" ]; then
  echo "Cần truyền module name"
  exit 1
fi

cd backend && ./gradlew :$module:bootrun