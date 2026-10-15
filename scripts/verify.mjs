import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const data = JSON.parse(await read('assets/data/original-portfolio.json'));
const profile = JSON.parse(await read('assets/data/profile.json'));
const aeWorks = JSON.parse(await read('assets/data/ae-works.json'));
const aigcWorks = JSON.parse(await read('assets/data/aigc-works.json'));
const html = await read('index.html');
const projects = html.split('id="all-projects">')[1].split('<div class="portfolio-empty"')[0];
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

assert.equal((projects.match(/data-filter-item/g) || []).length, data.works.length + aigcWorks.length + 2);
assert.equal((projects.match(/data-category="cat_software"/g) || []).length, 2);
assert(projects.includes('分镜工坊 · AI 分镜工具'));
assert(html.includes('data-filter="cat_aigc"'));
assert(html.includes('<option value="cat_aigc">AIGC 视频</option>'));
assert.equal((html.match(/data-portfolio-video /g) || []).length, aigcWorks.length);
for (const work of aigcWorks) {
  assert(projects.includes(escape(work.title)));
  await access(new URL(work.video, root));
  await access(new URL(work.poster, root));
}
for (const work of data.works) {
  assert(projects.includes(escape(work.title)), `缺少作品：${work.title}`);
  assert(projects.includes(escape(work.author)), `缺少来源：${work.author}`);
  assert(projects.includes(`data-category="${work.categoryId}"`));
  if (work.bvid.startsWith('BV')) assert(projects.includes(`https://www.bilibili.com/video/${work.bvid}/`));
  if (work.pic) await access(new URL(`assets/images/works/${work.bvid}.jpg`, root));
}
for (const stat of profile.stats) {
  assert(html.includes(escape(stat.value)));
  assert(html.includes(escape(stat.label)));
}
for (const field of ['headline', 'sidebarSubtitle', 'intro', 'summary', 'projectSummary', 'statsNote']) {
  assert(html.includes(escape(profile[field])), `个人介绍与资料不同步：${field}`);
}
assert(html.includes(profile.introHeading.split('\n').map(escape).join('<br>')));
for (const capability of profile.capabilities) {
  assert(html.includes(escape(capability.title)));
  assert(html.includes(escape(capability.text)));
}
for (const group of profile.skills) {
  for (const skill of group.items) assert(html.includes(escape(skill.name)), `缺少技能：${skill.name}`);
}
for (const experience of profile.experiences) {
  assert(html.includes(escape(experience.company)));
  assert(html.includes(`datetime="${experience.start}"`));
  assert(html.includes(`datetime="${experience.end}"`));
}
assert(html.includes(escape(profile.education.school)));
assert(html.includes(`mailto:${profile.email}`));
assert(html.includes(`tel:+86${profile.phone}`));
assert.equal((html.match(/data-page="/g) || []).length, 6);
assert.equal((html.match(/data-ae-video /g) || []).length, aeWorks.length);
for (const video of html.matchAll(/<video\b([^>]*data-ae-video[^>]*)>/g)) {
  for (const attribute of ['autoplay', 'muted', 'loop', 'playsinline', 'controls']) {
    assert(new RegExp(`\\b${attribute}\\b`).test(video[1]), `AE 预览缺少 ${attribute}`);
  }
}
for (const video of html.matchAll(/<video\b([^>]*data-portfolio-video[^>]*)>/g)) {
  assert(/\bcontrols\b/.test(video[1]));
  assert(/\bplaysinline\b/.test(video[1]));
  assert(!/\bautoplay\b/.test(video[1]));
}
for (const work of aeWorks) {
  assert(html.includes(escape(work.title)), `缺少 AE 动效：${work.title}`);
  await access(new URL(work.video, root));
  await access(new URL(work.poster, root));
}
assert(!/Richard hanrick|hello@example\.com|richard@example\.com|Lorem ipsum|href="#"/.test(html));
for (const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) await access(new URL(match[1], root));
new vm.Script(await read('assets/js/script.js'));
console.log(`通过：${data.works.length} 个原作品、${aigcWorks.length} 个 AIGC 视频、2 个软件案例、${aeWorks.length} 个 AE 预览、简历资料、本地资源和 JavaScript 语法。`);
