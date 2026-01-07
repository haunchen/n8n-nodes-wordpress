# WordPress Webhook 設定指南

[English Version](./webhook-setup.md)

本指南說明如何設定 WordPress，在特定事件發生時（文章發布、更新、刪除、新評論、新使用者）發送 webhook 通知到 n8n。

## 前置需求

- 已設定 WordPress Trigger 節點的 n8n 執行個體
- WordPress 管理員權限
- 以下其中一項：WP Webhooks 外掛 或 可新增 PHP 程式碼的權限

## 取得 Webhook URL

1. 在 n8n 工作流程中新增「WordPress Trigger」節點
2. 選擇要監聽的事件類型
3. 儲存並啟用工作流程
4. 複製節點中顯示的 webhook URL（測試用 Test URL，正式環境用 Production URL）

---

## 方案 A：使用 WP Webhooks 外掛（推薦）

### 步驟 1：安裝 WP Webhooks

1. 前往「外掛」→「安裝外掛」
2. 搜尋「WP Webhooks」
3. 安裝並啟用外掛

### 步驟 2：設定 Webhook

1. 前往「設定」→「WP Webhooks」
2. 點擊「Send Data」分頁
3. 找到你要監聽的動作（例如：「Post created」）
4. 點擊「Add webhook URL」
5. 貼上你的 n8n webhook URL
6. 設定 webhook：
   - 新增 header `X-WP-Webhook-Event`，值為對應的事件（例如：`post_published`）
   - （選用）新增 header `X-WP-Webhook-Token`，填入你的密鑰

### 事件對照表

| WP Webhooks 動作 | n8n 事件值 |
|-----------------|-----------|
| post_create | post_published |
| post_update | post_updated |
| post_delete | post_deleted |
| create_comment | comment_created |
| user_register | user_registered |

---

## 方案 B：使用 PHP Code Snippets

使用 Code Snippets 外掛或直接編輯佈景主題的 functions.php 檔案。

### 步驟 1：安裝 Code Snippets 外掛（選用）

1. 前往「外掛」→「安裝外掛」
2. 搜尋「Code Snippets」
3. 安裝並啟用

### 步驟 2：新增 Webhook 程式碼

前往「Snippets」→「Add New」（或編輯 functions.php）並加入以下程式碼：

### 完整整合程式碼（所有事件）

```php
<?php
/**
 * n8n WordPress Webhook 整合
 * 當 WordPress 發生各種事件時，發送 webhook 通知到 n8n
 */

// 設定 - 請替換為你的值
define('N8N_WEBHOOK_URL', '你的_N8N_WEBHOOK_URL');
define('N8N_WEBHOOK_TOKEN', ''); // 選用：填入你的密鑰

/**
 * 發送 webhook 到 n8n
 */
function n8n_send_webhook($event, $data) {
    if (empty(N8N_WEBHOOK_URL)) {
        return;
    }

    $headers = array(
        'Content-Type' => 'application/json',
        'X-WP-Webhook-Event' => $event,
    );

    if (!empty(N8N_WEBHOOK_TOKEN)) {
        $headers['X-WP-Webhook-Token'] = N8N_WEBHOOK_TOKEN;
    }

    $data['event'] = $event;
    $data['timestamp'] = current_time('c');
    $data['site_url'] = get_site_url();
    $data['site_name'] = get_bloginfo('name');

    wp_remote_post(N8N_WEBHOOK_URL, array(
        'headers' => $headers,
        'body' => wp_json_encode($data),
        'timeout' => 30,
        'blocking' => false, // 非阻塞模式，效能較好
    ));
}

/**
 * 文章發布 - 當文章狀態轉為「publish」時觸發
 */
add_action('transition_post_status', function($new_status, $old_status, $post) {
    // 只在文章首次發布時觸發
    if ($new_status === 'publish' && $old_status !== 'publish') {
        // 跳過修訂版和自動草稿
        if ($post->post_type === 'revision' || $post->post_status === 'auto-draft') {
            return;
        }

        n8n_send_webhook('post_published', array(
            'post_id' => $post->ID,
            'post_type' => $post->post_type,
            'post_title' => $post->post_title,
            'post_status' => $new_status,
            'post_url' => get_permalink($post->ID),
            'post_author' => $post->post_author,
            'post_author_name' => get_the_author_meta('display_name', $post->post_author),
            'post_excerpt' => $post->post_excerpt,
            'post_date' => $post->post_date,
        ));
    }
}, 10, 3);

/**
 * 文章更新 - 當已發布的文章被更新時觸發
 */
add_action('post_updated', function($post_id, $post_after, $post_before) {
    // 只在已發布的文章更新時觸發（非首次發布）
    if ($post_after->post_status === 'publish' && $post_before->post_status === 'publish') {
        // 跳過修訂版
        if ($post_after->post_type === 'revision') {
            return;
        }

        n8n_send_webhook('post_updated', array(
            'post_id' => $post_id,
            'post_type' => $post_after->post_type,
            'post_title' => $post_after->post_title,
            'post_status' => $post_after->post_status,
            'post_url' => get_permalink($post_id),
            'post_author' => $post_after->post_author,
            'post_author_name' => get_the_author_meta('display_name', $post_after->post_author),
            'previous_title' => $post_before->post_title,
        ));
    }
}, 10, 3);

/**
 * 文章刪除 - 在文章被刪除前觸發
 */
add_action('before_delete_post', function($post_id) {
    $post = get_post($post_id);

    // 跳過修訂版和自動草稿
    if (!$post || $post->post_type === 'revision' || $post->post_status === 'auto-draft') {
        return;
    }

    n8n_send_webhook('post_deleted', array(
        'post_id' => $post_id,
        'post_type' => $post->post_type,
        'post_title' => $post->post_title,
        'post_status' => $post->post_status,
        'post_author' => $post->post_author,
    ));
});

/**
 * 新評論 - 當新評論被建立時觸發
 */
add_action('wp_insert_comment', function($comment_id, $comment) {
    $post = get_post($comment->comment_post_ID);

    n8n_send_webhook('comment_created', array(
        'comment_id' => $comment_id,
        'comment_post_id' => $comment->comment_post_ID,
        'comment_post_title' => $post ? $post->post_title : '',
        'comment_author' => $comment->comment_author,
        'comment_author_email' => $comment->comment_author_email,
        'comment_author_url' => $comment->comment_author_url,
        'comment_content' => $comment->comment_content,
        'comment_approved' => $comment->comment_approved,
        'comment_type' => $comment->comment_type,
    ));
}, 10, 2);

/**
 * 新使用者 - 當新使用者註冊時觸發
 */
add_action('user_register', function($user_id) {
    $user = get_userdata($user_id);

    if (!$user) {
        return;
    }

    n8n_send_webhook('user_registered', array(
        'user_id' => $user_id,
        'user_login' => $user->user_login,
        'user_email' => $user->user_email,
        'user_nicename' => $user->user_nicename,
        'display_name' => $user->display_name,
        'user_role' => implode(', ', $user->roles),
        'user_registered' => $user->user_registered,
    ));
});
```

### 個別事件程式碼

如果你只需要特定事件，可以使用以下個別程式碼：

#### 僅文章發布

```php
<?php
add_action('transition_post_status', function($new_status, $old_status, $post) {
    if ($new_status === 'publish' && $old_status !== 'publish' && $post->post_type !== 'revision') {
        wp_remote_post('你的_N8N_WEBHOOK_URL', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WP-Webhook-Event' => 'post_published',
            ),
            'body' => wp_json_encode(array(
                'event' => 'post_published',
                'post_id' => $post->ID,
                'post_type' => $post->post_type,
                'post_title' => $post->post_title,
                'post_url' => get_permalink($post->ID),
                'timestamp' => current_time('c'),
            )),
            'timeout' => 30,
        ));
    }
}, 10, 3);
```

#### 僅新評論

```php
<?php
add_action('wp_insert_comment', function($comment_id, $comment) {
    wp_remote_post('你的_N8N_WEBHOOK_URL', array(
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-WP-Webhook-Event' => 'comment_created',
        ),
        'body' => wp_json_encode(array(
            'event' => 'comment_created',
            'comment_id' => $comment_id,
            'comment_author' => $comment->comment_author,
            'comment_content' => $comment->comment_content,
            'timestamp' => current_time('c'),
        )),
        'timeout' => 30,
    ));
}, 10, 2);
```

---

## 安全性建議

1. webhook URL 一律使用 HTTPS
2. 在 n8n 和 WordPress 兩端都設定密鑰（Secret Token）進行請求驗證
3. 考慮使用 Web 應用程式防火牆（WAF）
4. 監控 webhook 日誌，注意異常活動
5. 如果可能，限制 webhook 的存取 IP

---

## 疑難排解

| 問題 | 解決方案 |
|-----|---------|
| Webhook 沒有觸發 | 檢查 WordPress 錯誤日誌（`wp-content/debug.log`） |
| 連線逾時 | 確認 n8n 可從 WordPress 伺服器存取 |
| 403 Forbidden | 檢查防火牆/安全外掛設定（Wordfence、Sucuri 等） |
| 無效密鑰錯誤 | 確認 n8n 和 WordPress 兩端的密鑰一致 |
| 事件重複觸發 | 檢查是否有重複的 hooks 或外掛衝突 |

### 啟用 WordPress 除錯日誌

在 `wp-config.php` 中加入：

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### 手動測試 Webhook

使用以下程式碼測試 webhook 是否正常運作：

```php
<?php
// 新增到 snippet 中執行一次
wp_remote_post('你的_N8N_WEBHOOK_URL', array(
    'headers' => array(
        'Content-Type' => 'application/json',
        'X-WP-Webhook-Event' => 'test',
    ),
    'body' => wp_json_encode(array(
        'event' => 'test',
        'message' => 'WordPress webhook 測試',
        'timestamp' => current_time('c'),
    )),
    'timeout' => 30,
));
echo 'Webhook 已發送！';
```

---

## 各方案比較

| 方式 | 優點 | 缺點 |
|-----|------|------|
| WP Webhooks 外掛 | 有圖形介面、容易設定 | 需安裝額外外掛 |
| Code Snippets 外掛 | 程式碼管理方便、可開關 | 需安裝額外外掛 |
| functions.php | 最簡單、不需外掛 | 換主題或更新可能遺失 |
| mu-plugins | 穩定、自動載入 | 需 FTP/SSH 存取 |

---

## 參考資源

- [WordPress REST API 手冊](https://developer.wordpress.org/rest-api/)
- [WordPress 外掛 Hooks](https://developer.wordpress.org/plugins/hooks/)
- [WP Webhooks 外掛](https://wordpress.org/plugins/wp-webhooks/)
- [Code Snippets 外掛](https://wordpress.org/plugins/code-snippets/)
