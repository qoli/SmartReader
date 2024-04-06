// 儲存資料
async function saveData(key, data) {
  try {
    const obj = {};
    obj[key] = data;
    await browser.storage.local.set(obj);
    console.log("資料已儲存");
  } catch (error) {
    console.error("儲存資料時發生錯誤:", error);
  }
}

// 讀取資料
async function loadData(key) {
  try {
    const result = await browser.storage.local.get(key);
    const data = result[key];
    console.log("讀取到的資料:", data);
  } catch (error) {
    console.error("讀取資料時發生錯誤:", error);
  }
}
