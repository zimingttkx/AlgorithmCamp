// LeetCode sync script generator
// Stored in a plain .js file (not a Vue SFC) to avoid Vue compiler parsing issues.

const LC_URL = 'https://leetcode.cn/graphql'

const lines = [
  '(async()=>{',
  `  const r1=await fetch('${LC_URL}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'query{userStatus{username isSignedIn}}'})} );`,
  '  const d1=await r1.json();',
  '  const us=d1?.data?.userStatus;',
  `  if(!us?.isSignedIn||!us?.username){alert('未检测到登录状态，请在 leetcode.cn 登录后刷新页面重试');return;}`,
  '  const user=us.username;',
  '  const acSet=new Set();let offset=0,limit=20;',
  `  const gql='query(${'$'}skip:Int!,${'$'}limit:Int!){submissionList(offset:${'$'}skip,limit:${'$'}limit){submissions{statusDisplay question{questionFrontendId}}}}';`,
  '  while(true){',
  `    const r2=await fetch('${LC_URL}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:gql,variables:{skip:offset,limit:limit}})});`,
  '    const pd=await r2.json();',
  '    const subs=(pd?.data?.submissionList?.submissions)||[];',
  '    if(!subs.length)break;',
  `    subs.filter(s=>s.statusDisplay==='Accepted').forEach(s=>acSet.add(s.question.questionFrontendId));`,
  '    if(subs.length<limit)break;',
  '    offset+=limit;await new Promise(r=>setTimeout(r,300));',
  '  }',
  '  const acIds=[...acSet];',
  `  const result={source:'leetcode-cn',user,acIds,exportedAt:new Date().toISOString()};`,
  '  const out=JSON.stringify(result);',
  '  try{await navigator.clipboard.writeText(out);}catch(e){',
  '    const ta=document.createElement("textarea");ta.value=out;document.body.appendChild(ta);ta.focus();ta.select();document.execCommand("copy");document.body.removeChild(ta);',
  '  }',
  "  alert('用户: '+user+'\\n已导出 '+acIds.length+' 道AC题目！\\n请回到刷题网站点击「粘贴导入」');",
  '})();',
]

export const leetcodeScript = lines.join('\n')
