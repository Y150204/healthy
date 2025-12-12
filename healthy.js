// health-assistant-coze.js
// 适配原有Coze平台的健康助手扩展

(function() {
    'use strict';
    
    // 等待页面完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHealthAssistant);
    } else {
        initHealthAssistant();
    }
    
    function initHealthAssistant() {
        // 给一些时间让原页面渲染完成
        setTimeout(() => {
            // 查找合适的容器位置
            const container = findOrCreateContainer();
            if (!container) return;
            
            // 创建健康助手UI
            createHealthAssistantUI(container);
            
            // 绑定事件
            bindEvents();
            
            // 初始消息
            showWelcomeMessage();
            
            console.log('健康慧诊助手已初始化');
        }, 1000);
    }
    
    function findOrCreateContainer() {
        // 尝试找到现有聊天容器
        const existingChatAreas = document.querySelectorAll('[class*="chat"], [class*="message"], .semi-chat');
        
        for (const area of existingChatAreas) {
            if (area.clientHeight > 200) { // 找到足够大的聊天区域
                return area;
            }
        }
        
        // 如果没有找到，创建一个新的容器
        const mainContent = document.querySelector('main, .main-content, .coze-container, .semi-layout-content') || document.body;
        
        const container = document.createElement('div');
        container.className = 'health-assistant-coze-container';
        container.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 380px;
            height: 500px;
            background: var(--semi-color-bg-0);
            border-radius: var(--semi-border-radius-large);
            box-shadow: var(--semi-shadow-elevated);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid var(--semi-color-border);
        `;
        
        mainContent.appendChild(container);
        return container;
    }
    
    function createHealthAssistantUI(container) {
        // 头部
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 16px 20px;
            background: var(--semi-color-primary-light-default);
            color: var(--semi-color-text-0);
            border-bottom: 1px solid var(--semi-color-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="
                    width: 32px;
                    height: 32px;
                    background: var(--semi-color-primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                ">健</div>
                <div>
                    <div style="font-weight: 600; font-size: 16px;">健康慧诊助手</div>
                    <div style="font-size: 12px; color: var(--semi-color-text-2);">在线 · 可随时咨询</div>
                </div>
            </div>
            <button id="health-assistant-close" style="
                background: none;
                border: none;
                cursor: pointer;
                color: var(--semi-color-text-2);
                padding: 4px;
                border-radius: 4px;
            ">×</button>
        `;
        
        // 聊天区域
        const chatArea = document.createElement('div');
        chatArea.id = 'health-assistant-chat';
        chatArea.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--semi-color-bg-1);
        `;
        
        // 输入区域
        const inputArea = document.createElement('div');
        inputArea.style.cssText = `
            padding: 16px 20px;
            border-top: 1px solid var(--semi-color-border);
            background: var(--semi-color-bg-0);
        `;
        
        inputArea.innerHTML = `
            <div style="display: flex; gap: 8px;">
                <input type="text" 
                       id="health-assistant-input" 
                       placeholder="输入健康问题..." 
                       style="
                           flex: 1;
                           padding: 10px 16px;
                           border: 1px solid var(--semi-color-border);
                           border-radius: var(--semi-border-radius-medium);
                           background: var(--semi-color-bg-2);
                           color: var(--semi-color-text-0);
                           font-size: 14px;
                           outline: none;
                       ">
                <button id="health-assistant-send" style="
                    padding: 10px 20px;
                    background: var(--semi-color-primary);
                    color: white;
                    border: none;
                    border-radius: var(--semi-border-radius-medium);
                    cursor: pointer;
                    font-weight: 600;
                ">发送</button>
            </div>
            <div style="
                margin-top: 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            ">
                <button class="quick-question" data-question="头痛怎么办？" style="
                    padding: 6px 12px;
                    background: var(--semi-color-fill-0);
                    border: 1px solid var(--semi-color-border);
                    border-radius: 16px;
                    font-size: 12px;
                    cursor: pointer;
                    color: var(--semi-color-text-1);
                ">头痛</button>
                <button class="quick-question" data-question="发烧了怎么处理？" style="
                    padding: 6px 12px;
                    background: var(--semi-color-fill-0);
                    border: 1px solid var(--semi-color-border);
                    border-radius: 16px;
                    font-size: 12px;
                    cursor: pointer;
                    color: var(--semi-color-text-1);
                ">发烧</button>
                <button class="quick-question" data-question="胃不舒服怎么办？" style="
                    padding: 6px 12px;
                    background: var(--semi-color-fill-0);
                    border: 1px solid var(--semi-color-border);
                    border-radius: 16px;
                    font-size: 12px;
                    cursor: pointer;
                    color: var(--semi-color-text-1);
                ">胃痛</button>
                <button class="quick-question" data-question="如何改善睡眠？" style="
                    padding: 6px 12px;
                    background: var(--semi-color-fill-0);
                    border: 1px solid var(--semi-color-border);
                    border-radius: 16px;
                    font-size: 12px;
                    cursor: pointer;
                    color: var(--semi-color-text-1);
                ">失眠</button>
            </div>
        `;
        
        // 组装
        container.appendChild(header);
        container.appendChild(chatArea);
        container.appendChild(inputArea);
        
        // 保存引用
        window.healthAssistantContainer = container;
        window.healthAssistantChat = chatArea;
        window.healthAssistantInput = document.getElementById('health-assistant-input');
    }
    
    function bindEvents() {
        // 关闭按钮
        document.getElementById('health-assistant-close').addEventListener('click', () => {
            window.healthAssistantContainer.style.display = 'none';
        });
        
        // 发送按钮
        document.getElementById('health-assistant-send').addEventListener('click', sendMessage);
        
        // 输入框回车
        document.getElementById('health-assistant-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // 快捷问题
        document.querySelectorAll('.quick-question').forEach(button => {
            button.addEventListener('click', (e) => {
                const question = e.target.dataset.question;
                document.getElementById('health-assistant-input').value = question;
                sendMessage(question);
            });
        });
        
        // 拖动功能
        makeDraggable(window.healthAssistantContainer);
    }
    
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const header = element.querySelector('div:first-child');
        header.style.cursor = 'move';
        
        header.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;
            
            // 限制在窗口内
            const maxTop = window.innerHeight - element.offsetHeight - 50;
            const maxLeft = window.innerWidth - element.offsetWidth - 50;
            
            element.style.top = Math.max(50, Math.min(newTop, maxTop)) + 'px';
            element.style.left = Math.max(50, Math.min(newLeft, maxLeft)) + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        }
        
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    function showWelcomeMessage() {
        addMessage({
            type: 'assistant',
            content: '您好！我是健康慧诊助手，我可以为您提供：\n\n• 常见症状分析\n• 健康饮食建议\n• 生活作息指导\n• 用药注意事项\n• 就医建议参考\n\n请告诉我您关心的问题，或点击上方快捷按钮开始咨询。',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }
    
    function sendMessage(customQuestion = null) {
        const input = document.getElementById('health-assistant-input');
        const question = customQuestion || input.value.trim();
        
        if (!question) return;
        
        // 用户消息
        addMessage({
            type: 'user',
            content: question,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        
        if (!customQuestion) {
            input.value = '';
        }
        
        // 显示正在输入
        showTypingIndicator();
        
        // 模拟API响应
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateResponse(question);
            addMessage({
                type: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }, 1000 + Math.random() * 1000);
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'health-assistant-typing';
        typingDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--semi-color-text-2);
            font-size: 12px;
            margin: 10px 0;
        `;
        typingDiv.innerHTML = `
            <span>健康助手正在输入</span>
            <span class="typing-dots">...</span>
        `;
        
        window.healthAssistantChat.appendChild(typingDiv);
        
        // 动画效果
        const dots = typingDiv.querySelector('.typing-dots');
        let dotCount = 0;
        window.typingInterval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
            dots.textContent = '.'.repeat(dotCount);
        }, 300);
        
        scrollToBottom();
    }
    
    function removeTypingIndicator() {
        const typing = document.getElementById('health-assistant-typing');
        if (typing) {
            typing.remove();
        }
        if (window.typingInterval) {
            clearInterval(window.typingInterval);
        }
    }
    
    function addMessage(message) {
        const chat = window.healthAssistantChat;
        const messageDiv = document.createElement('div');
        
        messageDiv.style.cssText = `
            margin-bottom: 16px;
            max-width: 80%;
            animation: fadeIn 0.3s ease;
        `;
        
        if (message.type === 'user') {
            messageDiv.style.cssText += `
                margin-left: auto;
                background: var(--semi-color-primary-light-default);
                color: var(--semi-color-text-0);
                padding: 10px 16px;
                border-radius: 16px 16px 4px 16px;
                border: 1px solid var(--semi-color-primary-light-hover);
            `;
        } else {
            messageDiv.style.cssText += `
                background: var(--semi-color-fill-0);
                color: var(--semi-color-text-0);
                padding: 12px 16px;
                border-radius: 16px 16px 16px 4px;
                border: 1px solid var(--semi-color-border);
                white-space: pre-line;
                line-height: 1.5;
            `;
        }
        
        messageDiv.textContent = message.content;
        
        // 添加时间戳
        const timeSpan = document.createElement('div');
        timeSpan.textContent = message.timestamp;
        timeSpan.style.cssText = `
            font-size: 11px;
            color: var(--semi-color-text-3);
            margin-top: 4px;
            text-align: ${message.type === 'user' ? 'right' : 'left'};
        `;
        messageDiv.appendChild(timeSpan);
        
        chat.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function scrollToBottom() {
        const chat = window.healthAssistantChat;
        chat.scrollTop = chat.scrollHeight;
    }
    
    function generateResponse(question) {
        const responses = {
            '头痛': '头痛可能的原因：\n\n1. 紧张性头痛：压力、疲劳引起\n2. 偏头痛：伴随恶心、畏光\n3. 鼻窦性头痛：感冒或过敏\n\n建议：\n• 休息放松\n• 适度冷敷\n• 保持水分\n• 如果持续或加重，建议就医',
            '发烧': '发烧处理指南：\n\n体温分级：\n• 低热：37.3-38°C\n• 中等热：38.1-39°C\n• 高热：39.1-41°C\n\n处理建议：\n• 多喝水\n• 物理降温\n• 适当用药\n• 密切观察\n\n如体温超过39°C或持续3天不退，请就医。',
            '胃痛': '胃痛可能原因：\n\n1. 消化不良\n2. 胃炎\n3. 胃溃疡\n4. 胆囊问题\n\n饮食建议：\n✓ 温和易消化食物\n✓ 少量多餐\n✓ 避免刺激性食物\n\n注意：如疼痛剧烈或呕血，立即就医。',
            '失眠': '改善睡眠建议：\n\n1. 建立规律作息\n2. 睡前1小时远离电子设备\n3. 保持卧室黑暗安静\n4. 避免咖啡因和酒精\n5. 尝试放松技巧（冥想、深呼吸）\n\n持续失眠建议咨询医生。'
        };
        
        // 关键词匹配
        for (const [keyword, response] of Object.entries(responses)) {
            if (question.includes(keyword)) {
                return response;
            }
        }
        
        // 默认响应
        return `感谢您的咨询："${question}"\n\n我是健康慧诊助手，我的建议仅供参考，不能替代专业医疗诊断。\n\n建议您：\n1. 详细记录症状\n2. 观察变化趋势\n3. 如有需要，及时咨询医生\n\n您还可以问我：头痛、发烧、胃痛、失眠等常见问题的处理方法。`;
    }
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .health-assistant-coze-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .health-assistant-coze-container::-webkit-scrollbar-track {
            background: var(--semi-color-fill-0);
        }
        
        .health-assistant-coze-container::-webkit-scrollbar-thumb {
            background: var(--semi-color-fill-2);
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);
    
    // 暴露API
    window.HealthAssistantCoze = {
        show: function() {
            if (window.healthAssistantContainer) {
                window.healthAssistantContainer.style.display = 'flex';
            }
        },
        hide: function() {
            if (window.healthAssistantContainer) {
                window.healthAssistantContainer.style.display = 'none';
            }
        },
        sendMessage: sendMessage,
        addMessage: addMessage
    };
})();
