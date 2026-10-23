#!/usr/bin/env bash
set -euo pipefail
session="algoflow-current-smoke"
url="${SORTING_TEST_URL:-http://127.0.0.1:3111}"
browser() { agent-browser --session "$session" "$@"; }
trap 'browser close >/dev/null 2>&1 || true' EXIT
browser open "$url/visualizer?algorithm=bubble&array=3,1,2"
browser wait --fn "document.querySelector('[data-sorting-step]')?.getAttribute('data-sorting-step')==='0' && document.querySelector('[role=img]')?.getAttribute('aria-label').startsWith('当前数组：3、1、2。')"
browser find role button click --name '下一步' --exact
browser wait --fn "document.querySelector('[data-sorting-step]').getAttribute('data-sorting-step')==='1'"
browser eval "if(!document.querySelector('[role=img]').getAttribute('aria-label').startsWith('当前数组：3、1、2。'))throw Error('comparison skipped');'comparison verified'"
browser find role button click --name '下一步' --exact
browser wait --fn "document.querySelector('[role=img]').getAttribute('aria-label').startsWith('当前数组：1、3、2。')"
browser find role button click --name '上一步' --exact
browser find role button click --name '上一步' --exact
browser wait --fn "document.querySelector('[data-sorting-step]').getAttribute('data-sorting-step')==='0'"
browser find role button click --name '数据设置' --exact
browser fill '#array-input' '0, nope'
browser find role button click --name '应用数据' --exact
browser wait --fn "document.querySelector('#array-input').getAttribute('aria-invalid')==='true'"
browser fill '#array-input' '3, 1, 2'
browser find role button click --name '应用数据' --exact
browser wait --fn "!document.querySelector('#array-input')"
browser find role combobox click --name '选择算法' --exact
browser find role option click --name '归并排序' --exact
browser wait --fn "document.querySelector('h1').innerText==='归并排序'"
browser set viewport 390 844
browser eval "if(document.documentElement.scrollWidth>innerWidth)throw Error('mobile overflow');'mobile width verified'"
browser network route '**/ai/kb/list/page/vo' --body '{"code":0,"data":{"records":[]}}'
browser find role button click --name '解释当前步骤' --exact
browser wait --fn "document.body.innerText.includes('暂无可用知识库')"
browser network unroute '**/ai/kb/list/page/vo'
browser network route '**/ai/kb/list/page/vo' --body '{"code":0,"data":{"records":[{"id":"2002","name":"受控课程知识库"}]}}'
browser find role button click --name '重新加载' --exact
browser wait --fn "document.body.innerText.includes('受控课程知识库')"
browser eval --stdin <<'JS'
window.__ragMode='done';window.__ragRequests=[];
const realFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{
  const request=new Request(input,init);
  if(!request.url.includes('/ai/rag/ask/stream/events'))return realFetch(input,init);
  const body=await request.clone().json();window.__ragRequests.push(body);
  return new Response(new ReadableStream({
    start(controller){
      controller.enqueue(new TextEncoder().encode('data: '+JSON.stringify({type:'answer',content:window.__ragMode==='done'?'已完成的受控回答':'已经收到的部分回答'})+'\r\n\r\n'));
      if(window.__ragMode==='done')controller.enqueue(new TextEncoder().encode('data: '+JSON.stringify({type:'done',sources:[{documentName:'sorting-merge.md',chunkId:'controlled-sample',version:body.teachingContext.courseVersion,content:'受控引用片段'}]})+'\r\n\r\n'));
      request.signal.addEventListener('abort',()=>controller.error(new DOMException('Aborted','AbortError')));
    },cancel(){window.__ragCancelled=true}
  }),{headers:{'Content-Type':'text/event-stream'}});
};'controlled stream installed'
JS
browser find role textbox fill --name '向 AI 提问' '解释当前步骤'
browser find role button click --name '发送问题' --exact
browser wait --fn "document.body.innerText.includes('sorting-merge.md')"
browser eval "if(!window.__ragCancelled || !window.__ragRequests[0].teachingContext.codeSnippet || !window.__ragRequests[0].teachingContext.courseVersion)throw Error('context or stream completion missing');'context and references verified'"
browser eval "window.__ragMode='partial';'hold next stream open'"
browser find role textbox fill --name '向 AI 提问' '测试中断'
browser find role button click --name '发送问题' --exact
browser wait --fn "document.body.innerText.includes('已经收到的部分回答')"
browser find role button click --name '停止生成' --exact
browser wait --fn "document.body.innerText.includes('已中断')"
browser eval "if(!document.body.innerText.includes('已经收到的部分回答'))throw Error('partial answer lost');if(document.documentElement.scrollWidth>innerWidth)throw Error('dialog overflow');'stop retained partial answer'"
browser press Escape
browser wait --fn "!document.querySelector('[role=dialog]')"
browser find role button click --name '打开导航菜单' --exact
browser wait --fn "Boolean(document.querySelector('[role=dialog]'))"
browser press Escape
browser wait --fn "!document.querySelector('[role=dialog]')"
browser open "$url/sorting"
browser wait --fn "document.querySelector('h1')?.innerText==='算法学习'"
browser find role textbox fill --name '搜索算法' '不存在的算法'
browser find role button click --name '搜索' --exact
browser wait --fn "document.body.innerText.includes('暂无匹配算法')"
