<?php get_header(); ?>

<!-- Using DaisyUI Container for layout -->
<div class="container mx-auto px-4">
<h1 class="text-3xl font-bold my-4">Manage Process</h1>
    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
        <!-- Using DaisyUI Card for individual posts -->
        <article class="process card bg-base-100 shadow-xl p-5 mb-5">
            <h1 class="card-title text-3xl font-bold mb-3"><?php the_title(); ?></h1>
            <div class="process-content mb-4"><?php the_content(); ?></div>

            <?php if (current_user_can('edit_posts')) : ?>
                <!-- Form styled with DaisyUI components -->
                <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post" class="form-control">
                    <input type="hidden" name="action" value="obatala_update_process">
                    <input type="hidden" name="post_id" value="<?php the_ID(); ?>">

                    <!-- Using DaisyUI textarea -->
                    <label class="label">
                        <span class="label-text">Edit Content:</span>
                    </label>
                    <textarea class="textarea textarea-bordered h-24" name="process_content"><?php echo esc_textarea(get_the_content(null, false, get_the_ID())); ?></textarea>

                    <!-- Using DaisyUI button -->
                    <button type="submit" class="btn btn-primary mt-4">Update Process</button>
                </form>
            <?php endif; ?>
        </article>
    <?php endwhile; else : ?>
        <p><?php _e('No process found.', 'obatala'); ?></p>
    <?php endif; ?>
</div>

<?php get_footer(); ?>
