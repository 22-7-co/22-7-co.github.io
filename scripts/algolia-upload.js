const algoliasearch = require('algoliasearch');
const fs = require('fs');

async function upload() {
  const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY, ALGOLIA_INDEX_NAME } = process.env;
  
  // 自动兼容 v4 和 v5 版本的初始化逻辑
  const client = typeof algoliasearch === 'function' 
    ? algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY) 
    : algoliasearch.algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

  try {
    const records = JSON.parse(fs.readFileSync('public/algolia.json', 'utf8'));
    console.log(`读取到 ${records.length} 条记录，开始上传...`);

    // 如果是 v4 (旧版)
    if (client.initIndex) {
      const index = client.initIndex(ALGOLIA_INDEX_NAME);
      await index.clearObjects();
      const result = await index.saveObjects(records);
      console.log('✅ 上传成功:', result.objectIDs.length);
    } 
    // 如果是 v5 (最新版)
    else {
      await client.replaceAllObjects({
        indexName: ALGOLIA_INDEX_NAME,
        objects: records,
      });
      console.log('✅ 上传成功 (v5 模式)');
    }
  } catch (error) {
    console.error('❌ 上传失败:', error.message);
    process.exit(1);
  }
}

upload();