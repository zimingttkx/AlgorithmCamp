// LeetCode sync script generator
// Uses userProfileUserQuestionProgress to get all AC problem IDs
// This avoids the submissionList API which requires a non-empty questionSlug

const LC_URL = 'https://leetcode.cn/graphql'

// Each line is a single-quoted string; inner strings use double quotes to avoid conflicts
const lines = [
  '(async()=>{',

  // Step 1: get current username
  // Note: isSignedIn = daily check-in status, NOT login status; use username to detect login
  `  const r1=await fetch('${LC_URL}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'query{userStatus{username slug}}'})} );`,
  '  const d1=await r1.json();',
  '  const us=d1?.data?.userStatus;',
  `  if(!us?.username){alert('未检测到登录状态，请在 leetcode.cn 登录后刷新页面重试\\n调试: '+JSON.stringify(d1));return;}`,
  '  const user=us.username;',
  '  const slug=us.slug||us.username;',

  // Step 2: fetch AC problem list via userProfileUserQuestionProgress
  `  const gql='query(${'$'}slug:String!){userProfileUserQuestionProgress(userSlug:${'$'}slug){numAcceptedQuestions{difficulty count} acSubmissionNum{difficulty count} solvedBeatsStats{difficulty percentage} userSessionBeatsPercentage{difficulty percentage} questions{translatedTitle difficulty questionFrontendId status}}}';`,
  `  const r2=await fetch('${LC_URL}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:gql,variables:{slug:slug}})});`,
  '  const d2=await r2.json();',
  '  const questions=d2?.data?.userProfileUserQuestionProgress?.questions||[];',
  `  const acIds=questions.filter(q=>q.status==='ac'||q.status==='AC'||q.status==='ACCEPTED').map(q=>q.questionFrontendId);`,

  // Step 3: export
  `  const result={source:'leetcode-cn',user,acIds,exportedAt:new Date().toISOString()};`,
  '  const out=JSON.stringify(result);',
  '  try{await navigator.clipboard.writeText(out);}catch(e){',
  '    const ta=document.createElement("textarea");ta.value=out;document.body.appendChild(ta);ta.focus();ta.select();document.execCommand("copy");document.body.removeChild(ta);',
  '  }',
  "  alert('用户: '+user+'\\n已导出 '+acIds.length+' 道AC题目！\\n请回到刷题网站点击「粘贴导入」');",
  '})();',
]

export const leetcodeScript = lines.join('\n')
