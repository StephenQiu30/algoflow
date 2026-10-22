#!/usr/bin/env bash
set -euo pipefail
session="algorithm-repair-smoke"
url="${SORTING_TEST_URL:-http://127.0.0.1:3111}"
browser() { agent-browser --session "$session" "$@"; }
trap 'browser close >/dev/null 2>&1 || true' EXIT
browser open "$url/sorting/bubble"
browser wait --fn "Array.from(document.querySelectorAll('[role=tab]')).some(t=>t.textContent.includes('算法可视化'))"
browser find role tab click --name '算法可视化' --exact
browser wait --fn "document.querySelector('figure') && document.querySelector('figure').getAttribute('aria-label').length>10"
browser find role button click --name '数组与播放设置' --exact
browser wait --fn "Boolean(document.getElementById('custom-array'))"
browser eval "document.querySelector('#custom-array').scrollIntoView({block:'center',behavior:'instant'});'input centered'"
browser fill '#custom-array' '3, 1, 2'
browser eval "document.querySelector('button[aria-label=\"应用自定义数组\"]').scrollIntoView({block:'center',behavior:'instant'});'submit centered'"
browser find role button click --name '应用自定义数组' --exact
browser find role button click --name '数组与播放设置' --exact
browser eval "document.querySelector('button[aria-label=\"下一步\"]').scrollIntoView({block:'center',behavior:'instant'});'controls centered'"
browser wait --fn "document.querySelector('figure').getAttribute('aria-label')==='当前数组：3、1、2'"
browser find role button click --name '下一步'
browser wait --fn "document.querySelector('[data-sorting-step]').getAttribute('data-sorting-step')==='1'"
browser eval "if(document.querySelector('figure').getAttribute('aria-label')!=='当前数组：3、1、2')throw Error('first event skipped');if(!document.querySelector('[role=status]').innerText.includes('比较 3 与 1'))throw Error('comparison missing');'first comparison verified'"
browser find role button click --name '下一步'
browser wait --fn "document.querySelector('figure').getAttribute('aria-label')==='当前数组：1、3、2'"
browser eval "if(document.querySelector('figure').getAttribute('aria-label')!=='当前数组：1、3、2')throw Error('swap missing');'swap verified'"
browser find role button click --name '上一步'
browser wait --fn "document.querySelector('[data-sorting-step]').getAttribute('data-sorting-step')==='1'"
browser find role button click --name '上一步'
browser wait --fn "document.querySelector('[data-sorting-step]').getAttribute('data-sorting-step')==='0'"
browser eval "if(document.querySelector('figure').getAttribute('aria-label')!=='当前数组：3、1、2')throw Error('initial frame missing');'rewind verified'"
browser eval "Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='归并').scrollIntoView({block:'center',behavior:'instant'});'algorithm choices centered'"
browser find role button click --name '归并' --exact
browser wait --fn "location.pathname==='/sorting/merge'"
browser find role tab click --name '算法可视化' --exact
browser wait --fn "document.querySelector('figure')!==null"
browser eval "if(document.querySelector('figure').getAttribute('aria-label')!=='当前数组：3、1、2')throw Error('route changed input');'same input across algorithms verified'"
browser set viewport 390 844
browser eval "if(document.documentElement.scrollWidth>innerWidth)throw Error('mobile overflow');'mobile width verified'"
browser network route '**/ai/kb/list/page/vo' --body '{"code":0,"data":{"records":[]}}'
browser find role button click --name 'AI 答疑'
browser wait --fn "document.body.innerText.includes('暂无可用知识库')"
browser wait 1500
browser eval "const calls=performance.getEntriesByType('resource').filter(e=>e.name.includes('/ai/kb/list/page/vo'));if(calls.length!==1)throw Error('knowledge list retried '+calls.length+' times');'empty knowledge list fetched once'"
browser network unroute '**/ai/kb/list/page/vo'
browser network route '**/ai/kb/list/page/vo' --body '{"code":0,"data":{"records":[{"id":"2002","name":"受控课程知识库"}]}}'
browser find role button click --name '重新加载'
browser wait --fn "document.body.innerText.includes('受控课程知识库')"
browser eval --stdin <<'JS'
window.__ragMode='done';window.__ragRequests=[];const realFetch=window.fetch.bind(window);window.fetch=async(url,options)=>{if(!String(url).includes('/ai/rag/ask/stream/events'))return realFetch(url,options);const request=JSON.parse(options.body);window.__ragRequests.push(request);return new Response(new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('data: '+JSON.stringify({type:'answer',content:window.__ragMode==='done'?'已完成的受控回答':'已经收到的部分回答'})+'\r\n\r\n'));if(window.__ragMode==='done')controller.enqueue(new TextEncoder().encode('data: '+JSON.stringify({type:'done',sources:[{documentName:'sorting-merge.md',chunkId:'controlled-sample',version:request.teachingContext.courseVersion,content:'受控引用片段'}]})+'\r\n\r\n'));options.signal.addEventListener('abort',()=>controller.error(new DOMException('Aborted','AbortError')))},cancel(){window.__ragCancelled=true}}),{headers:{'Content-Type':'text/event-stream'}})};'controlled stream installed'
JS
browser find role textbox fill --name '向 AI 提问' '解释当前步骤'
browser find role button click --name '发送问题'
browser wait --fn "document.body.innerText.includes('查看引用（1）')"
browser eval "if(!window.__ragCancelled || !window.__ragRequests[0].teachingContext.codeSnippet || !window.__ragRequests[0].teachingContext.courseVersion)throw Error('context or done cancellation missing');'context, references and stream completion verified'"
browser eval "window.__ragMode='partial';'hold next stream open'"
browser find role textbox fill --name '向 AI 提问' '测试中断'
browser find role button click --name '发送问题'
browser wait --fn "Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('停止生成'))"
browser wait --fn "document.body.innerText.includes('已经收到的部分回答')"
browser find role button click --name '停止生成'
browser wait --fn "document.body.innerText.includes('回答未完成，已保留收到的内容。')"
browser eval "if(!Array.from(document.querySelectorAll('[role=dialog] .prose')).at(-1).innerText.includes('已经收到的部分回答'))throw Error('partial answer lost');'stop retained partial answer'"
