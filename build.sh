#!/bin/sh
# 构建产物：dist/ 为自包含运行目录（含生产依赖），供 Trae 一键部署使用
set -eu

export NPM_CONFIG_REGISTRY='https://registry.npmjs.org/'
npm ci --registry='https://registry.npmjs.org/'
npm prune --omit=dev

rm -rf dist
mkdir -p dist
cp server.js package.json run.sh dist/
cp -R public dist/public
cp -R data dist/data
cp -R node_modules dist/node_modules
chmod 755 dist/run.sh
