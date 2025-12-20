# 在 WordPress REST API 中暴露 Yoast SEO Meta 欄位

[English Version](./yoast-seo-setup.md)

本指南說明如何設定 WordPress 以透過 REST API 暴露 Yoast SEO meta 欄位，這是 n8n WordPress 節點寫入 SEO 設定的必要條件。

## 為什麼需要此設定

預設情況下，Yoast SEO 的 meta 欄位不會暴露在 WordPress REST API 中。你需要使用 `register_post_meta()` 註冊這些欄位，才能透過 API 進行寫入。

## Meta 欄位對照表

| 欄位名稱 | 用途 |
|---------|------|
| `_yoast_wpseo_focuskw` | 焦點關鍵字 |
| `_yoast_wpseo_metadesc` | Meta 描述 |
| `_yoast_wpseo_title` | SEO 標題 |

---

## 方法 A：使用 Code Snippets 外掛（推薦）

1. 安裝並啟用 [Code Snippets](https://wordpress.org/plugins/code-snippets/) 外掛
2. 前往「Snippets」→「Add New」
3. 貼上以下程式碼並儲存：

```php
add_action('init', function() {
    $meta_fields = [
        '_yoast_wpseo_focuskw',
        '_yoast_wpseo_metadesc',
        '_yoast_wpseo_title',
    ];

    foreach ($meta_fields as $field) {
        register_post_meta('post', $field, [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            }
        ]);

        // 同時為頁面註冊
        register_post_meta('page', $field, [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'auth_callback' => function() {
                return current_user_can('edit_pages');
            }
        ]);
    }
});
```

---

## 方法 B：使用 mu-plugins

1. 透過 FTP/SSH 連線到伺服器
2. 建立檔案：`wp-content/mu-plugins/yoast-rest-api.php`
3. 寫入以下內容：

```php
<?php
/**
 * 將 Yoast SEO 欄位暴露到 REST API
 */
add_action('init', function() {
    $meta_fields = [
        '_yoast_wpseo_focuskw',
        '_yoast_wpseo_metadesc',
        '_yoast_wpseo_title',
    ];

    foreach ($meta_fields as $field) {
        register_post_meta('post', $field, [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            }
        ]);

        register_post_meta('page', $field, [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'auth_callback' => function() {
                return current_user_can('edit_pages');
            }
        ]);
    }
});
```

---

## 方法 C：自製外掛

1. 建立資料夾：`wp-content/plugins/yoast-rest-api/`
2. 建立檔案：`wp-content/plugins/yoast-rest-api/yoast-rest-api.php`
3. 寫入以下內容：

```php
<?php
/**
 * Plugin Name: Yoast REST API Fields
 * Description: 將 Yoast SEO 欄位暴露到 REST API
 * Version: 1.0
 * Author: Your Name
 */

add_action('init', function() {
    $meta_fields = [
        '_yoast_wpseo_focuskw',
        '_yoast_wpseo_metadesc',
        '_yoast_wpseo_title',
    ];

    foreach ($meta_fields as $field) {
        register_post_meta('post', $field, [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            }
        ]);

        register_post_meta('page', $field, [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'auth_callback' => function() {
                return current_user_can('edit_pages');
            }
        ]);
    }
});
```

4. 到 WordPress 後台「外掛」頁面啟用

---

## 各方法比較

| 方式 | 優點 | 缺點 |
|-----|------|------|
| Code Snippets | 有介面、好管理 | 需額外安裝外掛 |
| mu-plugins | 穩定、自動載入、無法被停用 | 需 FTP/SSH 存取 |
| 自製外掛 | 可從後台開關、好維護 | 需 FTP/SSH 存取 |
| functions.php | 最簡單 | 換主題或更新會遺失 |

---

## 支援自訂文章類型（CPT）

若要為自訂文章類型註冊，將 `register_post_meta` 的第一個參數改為對應的 post type：

```php
register_post_meta('your_custom_post_type', $field, [...]);
```

或註冊到所有文章類型：

```php
register_meta('post', $field, [
    'object_subtype' => '',  // 空字串表示所有類型
    'show_in_rest' => true,
    // ...
]);
```

---

## 疑難排解

- 若更新後 meta 欄位沒有出現，確認已正確呼叫 `register_post_meta`
- 若收到 401 Unauthorized 錯誤，檢查應用程式密碼和使用者權限
- 部分安全外掛可能會阻擋 REST API 存取

## 參考資源

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [register_post_meta() 官方文件](https://developer.wordpress.org/reference/functions/register_post_meta/)
- [Yoast SEO 開發者文件](https://developer.yoast.com/)
