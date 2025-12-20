# Exposing Yoast SEO Meta Fields in WordPress REST API

[繁體中文版](./yoast-seo-setup.zh-TW.md)

This guide explains how to configure WordPress to expose Yoast SEO meta fields via the REST API, which is required for the n8n WordPress node to write SEO settings.

## Why This Setup is Required

By default, Yoast SEO meta fields are not exposed in the WordPress REST API. You need to register these fields using `register_post_meta()` to enable writing via the API.

## Meta Field Reference

| Field Name | Purpose |
|-----------|---------|
| `_yoast_wpseo_focuskw` | Focus Keyword |
| `_yoast_wpseo_metadesc` | Meta Description |
| `_yoast_wpseo_title` | SEO Title |

---

## Method A: Using Code Snippets Plugin (Recommended)

1. Install and activate the [Code Snippets](https://wordpress.org/plugins/code-snippets/) plugin
2. Go to "Snippets" → "Add New"
3. Paste the following code and save:

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

        // Also register for pages
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

## Method B: Using mu-plugins

1. Connect to your server via FTP/SSH
2. Create file: `wp-content/mu-plugins/yoast-rest-api.php`
3. Add the following content:

```php
<?php
/**
 * Expose Yoast SEO fields to REST API
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

## Method C: Custom Plugin

1. Create folder: `wp-content/plugins/yoast-rest-api/`
2. Create file: `wp-content/plugins/yoast-rest-api/yoast-rest-api.php`
3. Add the following content:

```php
<?php
/**
 * Plugin Name: Yoast REST API Fields
 * Description: Expose Yoast SEO fields to REST API
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

4. Activate the plugin in WordPress admin

---

## Method Comparison

| Method | Pros | Cons |
|--------|------|------|
| Code Snippets | UI-based, easy to manage | Requires additional plugin |
| mu-plugins | Stable, auto-loads, cannot be disabled | Requires FTP/SSH access |
| Custom Plugin | Can be toggled from admin, maintainable | Requires FTP/SSH access |
| functions.php | Simplest | Lost on theme switch or update |

---

## Supporting Custom Post Types

To register for custom post types, change the first parameter of `register_post_meta`:

```php
register_post_meta('your_custom_post_type', $field, [...]);
```

Or register for all post types:

```php
register_meta('post', $field, [
    'object_subtype' => '',  // Empty string means all types
    'show_in_rest' => true,
    // ...
]);
```

---

## Troubleshooting

- If meta fields don't appear after update, verify that `register_post_meta` was called correctly
- For 401 Unauthorized errors, check your application password and user permissions
- Some security plugins may block REST API access

## References

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [register_post_meta() Documentation](https://developer.wordpress.org/reference/functions/register_post_meta/)
- [Yoast SEO Developer Docs](https://developer.yoast.com/)
