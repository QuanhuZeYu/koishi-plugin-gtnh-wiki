import type { Page, ElementHandle } from "puppeteer";
import Data from "../Data";


async function handleArticle(articleE: ElementHandle) {
    const markdown = await articleE.evaluate(async (a) => {
        function convertElementToMarkdown(element: Element): string {
            if (!element) return '';
            try {
                switch (element.tagName.toLowerCase()) {
                    case 'h1':
                        if (!element.textContent?.trim()) { return ''; }
                        return `# ${element.textContent?.trim()}\n`;
                    case 'h2':
                        if (!element.textContent?.trim()) { return ''; }
                        return `## ${element.textContent?.trim()}\n`;
                    case 'h3':
                        if (!element.textContent?.trim()) { return ''; }
                        return `### ${element.textContent?.trim()}\n`;
                    case 'h4':
                        if (!element.textContent?.trim()) { return ''; }
                        return `#### ${element.textContent?.trim()}\n`;
                    case 'p':
                        if (!element.textContent?.trim()) { return ''; }
                        return `${element.textContent?.trim()}\n`;
                    case 'ol':
                        return Array.from(element.querySelectorAll('li'))
                            .map((li, index) => `${index + 1}. ${li.textContent?.trim() || ''}`)
                            .join('\n') + '\n\n';
                    case 'ul':
                        return Array.from(element.querySelectorAll('li'))
                            .map(li => `- ${li.textContent?.trim() || ''}`)
                            .join('\n') + '\n\n';
                    case 'a':
                        const title = element.getAttribute('title') || '';
                        const href = (element as HTMLAnchorElement).href || '';
                        const linkText = element.textContent?.trim() || '';
                        if (title === '' && href === '' && linkText === '') { return ''; }
                        return `${title} [${linkText}](${href})`;
                    case 'img':
                        const src = element.getAttribute('src') || '';
                        const alt = element.getAttribute('alt') || 'image';
                        if (src === '') { return ''; }
                        return `![${alt}](${src})\n\n`;
                    case 'strong':
                    case 'b':
                        return `**${element.textContent?.trim() || ''}**`;
                    case 'em':
                    case 'i':
                        return `*${element.textContent?.trim() || ''}*`;
                    default:
                        return element.textContent?.trim() || '';
                }
            } catch (error) {
                console.error(`Error converting element ${element.tagName}:`, error);
                return '';  // 出现错误时返回空字符串以防崩溃
            }
        }
        function processChildNodes(node: Element): string {
            // 检查传入的 node 是否有效
            if (!node || !(node instanceof Element)) {
                return '';
            }
            
            let markdown = '';
            try {
                // 检查 childNodes 是否存在且不为空
                if (node.childNodes && node.childNodes.length > 0) {
                    node.childNodes.forEach(child => {
                        try {
                            if (child.nodeType === Node.ELEMENT_NODE) {
                                const element = child as Element;
                                markdown += convertElementToMarkdown(element);  // 转换当前元素
                                markdown += processChildNodes(element);         // 递归处理子节点
                            } else if (child.nodeType === Node.TEXT_NODE) {
                                const textContent = child.textContent?.trim() || '';
                                if (textContent) {
                                    markdown += textContent; // 合并非空的文本节点
                                }
                            }
                        } catch (error) {
                            console.error('Error processing child node:', error);
                        }
                    });
                }
            } catch (error) {
                console.error('Error processing node:', error);
                return '';  // 发生错误时返回空字符串
            }
            // 避免多余的换行和空段落
            return markdown.trim() ? markdown : '';
        }
        const markdown = processChildNodes(a)
        return markdown
    })
    return markdown
}


function convertElementToMarkdown(element: Element): string {
    if (!element) return '';
    try {
        switch (element.tagName.toLowerCase()) {
            case 'h1':
                if (!element.textContent?.trim()) { return ''; }
                return `# ${element.textContent?.trim()}\n`;
            case 'h2':
                if (!element.textContent?.trim()) { return ''; }
                return `## ${element.textContent?.trim()}\n`;
            case 'h3':
                if (!element.textContent?.trim()) { return ''; }
                return `### ${element.textContent?.trim()}\n`;
            case 'h4':
                if (!element.textContent?.trim()) { return ''; }
                return `#### ${element.textContent?.trim()}\n`;
            case 'p':
                if (!element.textContent?.trim()) { return ''; }
                return `${element.textContent?.trim()}\n`;
            case 'ol':
                return Array.from(element.querySelectorAll('li'))
                    .map((li, index) => `${index + 1}. ${li.textContent?.trim() || ''}`)
                    .join('\n') + '\n\n';
            case 'ul':
                return Array.from(element.querySelectorAll('li'))
                    .map(li => `- ${li.textContent?.trim() || ''}`)
                    .join('\n') + '\n\n';
            case 'a':
                const title = element.getAttribute('title') || '';
                const href = (element as HTMLAnchorElement).href || '';
                const linkText = element.textContent?.trim() || '';
                if (title === '' && href === '' && linkText === '') { return ''; }
                // return `${title} [${linkText}](${href})`;
                return
            case 'img':
                const src = element.getAttribute('src') || '';
                const alt = element.getAttribute('alt') || 'image';
                if (src === '') { return ''; }
                // return `![${alt}](${src})\n\n`;
                return
            case 'strong':
            case 'b':
                return `**${element.textContent?.trim() || ''}**`;
            case 'em':
            case 'i':
                return `*${element.textContent?.trim() || ''}*`;
            default:
                return element.textContent?.trim() || '';
        }
    } catch (error) {
        console.error(`Error converting element ${element.tagName}:`, error);
        return '';  // 出现错误时返回空字符串以防崩溃
    }
}
function processChildNodes(node: Element): string {
    // 检查传入的 node 是否有效
    if (!node || !(node instanceof Element)) {
        return '';
    }
    
    let markdown = '';
    try {
        // 检查 childNodes 是否存在且不为空
        if (node.childNodes && node.childNodes.length > 0) {
            node.childNodes.forEach(child => {
                try {
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        const element = child as Element;
                        markdown += convertElementToMarkdown(element);  // 转换当前元素
                        markdown += processChildNodes(element);         // 递归处理子节点
                    } else if (child.nodeType === Node.TEXT_NODE) {
                        const textContent = child.textContent?.trim() || '';
                        if (textContent) {
                            markdown += textContent; // 合并非空的文本节点
                        }
                    }
                } catch (error) {
                    console.error('Error processing child node:', error);
                }
            });
        }
    } catch (error) {
        console.error('Error processing node:', error);
        return '';  // 发生错误时返回空字符串
    }
    // 避免多余的换行和空段落
    return markdown.trim() ? markdown : '';
}

export default handleArticle