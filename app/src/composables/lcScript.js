// LeetCode sync script generator
// Stored in a plain .js file (not a Vue SFC) to avoid Vue compiler parsing issues.
// The generated script uses single-quoted JS strings with double-quoted GraphQL values.

const LC_URL = 'https://leetcode.cn/graphql'

// Script lines - all JS strings use single quotes, GraphQL string values use double quotes
const lines = [
  '(async()=>{',
  `  const r1=await fetch('${LC_URL}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'query{userStatus{username isSignedIn}}'})} );`,
  '  const d1=await r1.json();',
  '  const us=d1?.data?.userStatus;',
  `  if(!us?.isSignedIn||!us?.username){alert('未检测到登录状态，请在 leetcode.cn 登录后刷新页面重试');return;}`,
  '  const user=us.username;',
  '  const acSet=new Set();let offset=0,limit=20;',
  // questionSlug uses double quotes inside single-quoted JS string - no conflict
  `  const gql='query(${'$'}o:Int!,${'$'}l:Int!){submissionList(offset:${'$'}o,limit:${'$'}l,questionSlug:""){submissions{statusDisplay question{questionFrontendId}}}}';`,
  '  while(true){',
  `    const r2=await fetch('${LC_URL}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:gql,variables:{o:offset,l:limit}})});`,
  '    const pd=await r2.json();',
  `    const subs=pd?.data?.submissionList?.submissions||[];`,
  '    if(!subs.length)break;',
  `    subs.filter(s=>s.statusDisplay==='Accepted').forEach(s=>acSet.add(s.question.questionFrontendId));`,
  '    if(subs.length<limit)break;',
  '    offset+=limit;await new Promise(r=>setTimeout(r,250));',
  '  }',
  '  const acIds=[...acSet];',
  `  const result={source:'leetcode-cn',user,acIds,exportedAt:new Date().toISOString()};`,
  '  await navigator.clipboard.writeText(JSON.stringify(result));',
  "  alert('用户: '+user+'\\n已导出 '+acIds.length+' 道AC题目！\\n请回到刷题网站点击「粘贴导入」');",
  '})();',
]

export const leetcodeScript = lines.join('\n')
