#!/bin/bash

cd ./js
for f in *.js; do grep "function" < "$f"  > ../outlines/"$f".txt; done;
cd -
