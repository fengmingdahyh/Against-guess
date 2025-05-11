// content.js
// 从localStorage中加载已猜数字
let guessedPins = new Set(JSON.parse(localStorage.getItem('guessedPins') || '[]'));
let isSubmitting = false;
let submitDelay = 30000; // 默认30秒延迟
let submitInterval = null;  // 初始化为null
let firstSubmit = true;

// 将函数定义在全局作用域
window.autoSubmit = function() {
    if (isSubmitting) return;
    isSubmitting = true;

    let pin;
    do {
        // 生成4位随机数（允许以0开头）
        pin = Array.from({length: 4}, () => Math.floor(Math.random() * 10)).join('');
    } while (guessedPins.has(pin));
    guessedPins.add(pin);
    // 保存已猜数字到localStorage
    localStorage.setItem('guessedPins', JSON.stringify([...guessedPins]));

    // 查找输入框
    const input = document.getElementById('pin');
    if (!input) {
        isSubmitting = false;
        return;
    }

    // 设置输入值并触发事件
    input.value = pin;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // 查找提交按钮并点击
    const submitButton = document.querySelector('input[type="submit"][value="Guess"].float');
    if (submitButton) {
        submitButton.click();
    } else if (input.form) {  // 备用提交方式
        input.form.submit();
    }
    // 更新表格
    const tbody = document.getElementById('guessedPinsTable')?.getElementsByTagName('tbody')[0];
    if (tbody) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = pin;
        row.appendChild(cell);
        tbody.appendChild(row);
    }

    // 添加延迟逻辑
    setTimeout(() => {
        isSubmitting = false;
    }, 1000); // 改为1秒延迟，让用户能看到提交过程
};

window.startAutoSubmit = function() {
    // 如果已经在运行，先停止
    if (submitInterval) {
        clearInterval(submitInterval);
        submitInterval = null;
    }
    
    // 立即执行一次
    window.autoSubmit();
    
    // 设置定时器，从第二次开始使用设定的延迟
    submitInterval = setInterval(() => {
        if (!isSubmitting) {  // 只有在没有正在提交时才执行
            window.autoSubmit();
        }
    }, submitDelay);
};

window.stopAutoSubmit = function() {
    if (submitInterval) {
        clearInterval(submitInterval);
        submitInterval = null;
    }
    isSubmitting = false;
};

// 等待页面加载完成后执行
window.addEventListener('load', () => {
    // 创建启动按钮
    const startButton = document.createElement('button');
    startButton.textContent = '启动自动提交';
    startButton.style.position = 'fixed';
    startButton.style.top = '20px';
    startButton.style.right = '20px';
    startButton.style.zIndex = '9999';
    startButton.onclick = window.startAutoSubmit;

    // 创建停止按钮
    const stopButton = document.createElement('button');
    stopButton.textContent = '停止自动提交';
    stopButton.style.position = 'fixed';
    stopButton.style.top = '50px';
    stopButton.style.right = '20px';
    stopButton.style.zIndex = '9999';
    stopButton.onclick = window.stopAutoSubmit;

    // 创建折叠按钮
    const collapsible = document.createElement('button');
    collapsible.className = 'collapsible';
    collapsible.textContent = '查看已猜数字';

    // 创建显示内容的容器
    const content = document.createElement('div');
    content.className = 'content';
    // 创建表格
    const table = document.createElement('table');
    table.id = 'guessedPinsTable';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headerCell = document.createElement('th');
    headerCell.textContent = '已猜数字';
    headerRow.appendChild(headerCell);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    // 移动初始化表格内容的逻辑到此处
    guessedPins.forEach(pin => {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = pin;
        row.appendChild(cell);
        tbody.appendChild(row);
    });
    content.appendChild(table);

    // 添加点击事件监听器
    collapsible.addEventListener('click', function() {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });

    // 将按钮和内容添加到页面
    document.body.appendChild(collapsible);
    document.body.appendChild(content);

    // 引入CSS文件
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        link.href = chrome.runtime.getURL('styles.css');
    } else {
        link.href = 'styles.css';
    }
    document.head.appendChild(link);

    // 将启动按钮和停止按钮添加到页面
    document.body.appendChild(startButton);
    document.body.appendChild(stopButton);
    // 创建速度调节滑块
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '30000';
    speedSlider.max = '60000';
    speedSlider.value = '30000';
    speedSlider.style.position = 'fixed';
    speedSlider.style.top = '60px';
    speedSlider.style.right = '20px';
    speedSlider.style.zIndex = '9999';

    // 添加滑块标签
    const speedLabel = document.createElement('label');
    speedLabel.textContent = '提交延迟 (ms): ' + speedSlider.value;
    speedLabel.style.position = 'fixed';
    speedLabel.style.top = '80px';
    speedLabel.style.right = '20px';
    speedLabel.style.zIndex = '9999';

    // 添加滑块事件监听器
    speedSlider.addEventListener('input', function() {
        submitDelay = parseInt(this.value);
        speedLabel.textContent = '提交延迟 (ms): ' + this.value;
    });

    // 将滑块和标签添加到页面
    document.body.appendChild(speedSlider);
    document.body.appendChild(speedLabel);
});