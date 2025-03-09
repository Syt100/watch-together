import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const getGitInfo = () => {
    try {
        return {
            commit: execSync('git rev-parse HEAD').toString().trim(),
            tag: execSync('git describe --tags --always').toString().trim()
        }
    } catch (e) {
        return { commit: 'local', tag: 'dev' }
    }
}

/**
 * 输出示例: "2024-05-25 15:30:45+08:00"
 * @param {Date} date 
 * @returns {string} 格式化后的时间，带时区
 */
const getDateTimeWithTimezone = (date) => {
    // const date = new Date();

    // 使用瑞典区域设置直接生成 `YYYY-MM-DD HH:mm:ss` 格式
    const datetime = new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);

    // 计算时区偏移 (±HH:mm)
    const offset = date.getTimezoneOffset();
    const sign = offset > 0 ? '-' : '+';
    const hours = Math.abs(offset / 60 | 0).toString().padStart(2, '0');
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    const timezone = `${sign}${hours}:${minutes}`;

    return `${datetime}${timezone}`;
}



const buildInfo = {
    buildTime: getDateTimeWithTimezone(new Date()),
    ...getGitInfo()
}

writeFileSync(
    './public/build-info.json',
    JSON.stringify(buildInfo, null, 2)
)