# WordPress Webhook Setup for n8n

[中文版](./webhook-setup.zh-TW.md)

This guide explains how to configure WordPress to send webhook notifications to n8n when events occur (posts published, updated, deleted, new comments, new users).

## Prerequisites

- n8n instance with WordPress Trigger node configured
- WordPress admin access
- One of the following: WP Webhooks plugin OR ability to add PHP code

## Getting Your Webhook URL

1. Add "WordPress Trigger" node to your n8n workflow
2. Select the event type you want to monitor
3. Save and activate the workflow
4. Copy the webhook URL shown in the node (Test URL for testing, Production URL for live use)

---

## Method A: Using WP Webhooks Plugin (Recommended)

### Step 1: Install WP Webhooks

1. Go to Plugins → Add New
2. Search "WP Webhooks"
3. Install and activate the plugin

### Step 2: Configure Webhook

1. Go to Settings → WP Webhooks
2. Click "Send Data" tab
3. Find the action you want (e.g., "Post created")
4. Click "Add webhook URL"
5. Paste your n8n webhook URL
6. Configure the webhook:
   - Add header `X-WP-Webhook-Event` with value matching the event (e.g., `post_published`)
   - (Optional) Add header `X-WP-Webhook-Token` with your secret token

### Event Mapping

| WP Webhooks Action | n8n Event Value |
|-------------------|-----------------|
| post_create | post_published |
| post_update | post_updated |
| post_delete | post_deleted |
| create_comment | comment_created |
| user_register | user_registered |

---

## Method B: Using PHP Code Snippets

Use the Code Snippets plugin or add to your theme's functions.php file.

### Step 1: Install Code Snippets Plugin (Optional)

1. Go to Plugins → Add New
2. Search "Code Snippets"
3. Install and activate

### Step 2: Add the Webhook Code

Go to Snippets → Add New (or edit functions.php) and add the following code:

### Complete Integration Code (All Events)

```php
<?php
/**
 * n8n WordPress Webhook Integration
 * Sends webhook notifications to n8n for various WordPress events
 */

// Configuration - Replace these values
define('N8N_WEBHOOK_URL', 'YOUR_N8N_WEBHOOK_URL');
define('N8N_WEBHOOK_TOKEN', ''); // Optional: Add your secret token

/**
 * Send webhook to n8n
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
        'blocking' => false, // Non-blocking for better performance
    ));
}

/**
 * Post Published - Triggered when a post transitions to 'publish' status
 */
add_action('transition_post_status', function($new_status, $old_status, $post) {
    // Only trigger when post is first published
    if ($new_status === 'publish' && $old_status !== 'publish') {
        // Skip revisions and auto-drafts
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
 * Post Updated - Triggered when a published post is updated
 */
add_action('post_updated', function($post_id, $post_after, $post_before) {
    // Only trigger for published posts being updated (not first publish)
    if ($post_after->post_status === 'publish' && $post_before->post_status === 'publish') {
        // Skip revisions
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
 * Post Deleted - Triggered before a post is deleted
 */
add_action('before_delete_post', function($post_id) {
    $post = get_post($post_id);

    // Skip revisions and auto-drafts
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
 * Comment Created - Triggered when a new comment is inserted
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
 * User Registered - Triggered when a new user is created
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

### Individual Event Snippets

If you only need specific events, use these individual snippets:

#### Post Published Only

```php
<?php
add_action('transition_post_status', function($new_status, $old_status, $post) {
    if ($new_status === 'publish' && $old_status !== 'publish' && $post->post_type !== 'revision') {
        wp_remote_post('YOUR_N8N_WEBHOOK_URL', array(
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

#### Comment Created Only

```php
<?php
add_action('wp_insert_comment', function($comment_id, $comment) {
    wp_remote_post('YOUR_N8N_WEBHOOK_URL', array(
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

## Security Recommendations

1. Always use HTTPS for webhook URLs
2. Configure a secret token in both n8n and WordPress for request validation
3. Consider using a web application firewall (WAF)
4. Monitor webhook logs for unusual activity
5. Limit webhook access by IP if possible

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not triggering | Check WordPress error logs (`wp-content/debug.log`) |
| Connection timeout | Ensure n8n is accessible from WordPress server |
| 403 Forbidden | Check firewall/security plugin settings (Wordfence, Sucuri, etc.) |
| Invalid token error | Verify the token matches in both n8n and WordPress |
| Events firing multiple times | Check for duplicate hooks or plugin conflicts |

### Enable WordPress Debug Logging

Add to `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### Test Webhook Manually

Use this code to test if webhooks are working:

```php
<?php
// Add to a snippet and run once
wp_remote_post('YOUR_N8N_WEBHOOK_URL', array(
    'headers' => array(
        'Content-Type' => 'application/json',
        'X-WP-Webhook-Event' => 'test',
    ),
    'body' => wp_json_encode(array(
        'event' => 'test',
        'message' => 'WordPress webhook test',
        'timestamp' => current_time('c'),
    )),
    'timeout' => 30,
));
echo 'Webhook sent!';
```

---

## Reference

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WordPress Plugin Hooks](https://developer.wordpress.org/plugins/hooks/)
- [WP Webhooks Plugin](https://wordpress.org/plugins/wp-webhooks/)
- [Code Snippets Plugin](https://wordpress.org/plugins/code-snippets/)
