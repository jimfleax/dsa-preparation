import { getLeetCodeProblemInfo } from './src/lib/leetcodeScraperUtil.ts';

async function runTest() {
  console.log('Testing getLeetCodeProblemInfo...');
  const url = 'https://leetcode.com/problems/two-sum/';
  const result = await getLeetCodeProblemInfo(url);
  console.log('Result:', result);
}

runTest();
