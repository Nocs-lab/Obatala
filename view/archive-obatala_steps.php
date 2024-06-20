<?php get_header(); ?>

<div class="container mx-auto px-4">
    <h1 class="text-3xl font-bold my-4"><?php post_type_archive_title(); ?></h1>
    <?php if (have_posts()) : ?>
        <!-- DaisyUI Card for better aesthetics -->
        <div class="card bg-base-100 shadow-xl">
            <div class="card-body p-2">
                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <!-- Table head -->
                        <thead>
                            <tr>
                                <th>
                                    <label>
                                        <input type="checkbox" className="checkbox" />
                                    </label>
                                </th>
                                <th>Status</th>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Action</th>
                                <th>Author</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <!-- Table body -->
                        <tbody>
                            <?php while (have_posts()) : the_post(); ?>
                            <tr>
                                <th>
                                    <label>
                                        <input type="checkbox" className="checkbox" />
                                    </label>
                                </th>
                                <td>
                                    <span class="badge badge-success">Published</span>
                                </td>
                                <td><?php the_ID(); ?></td>
                                <td><?php the_title(); ?></td>
                                <td>
                                    <a href="<?php the_permalink(); ?>" class="btn btn-primary">View Process</a>
                                </td>
                                <td><?php the_author(); ?></td>
                                <td><?php the_date(); ?></td>
                            </tr>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
                <!-- Posts navigation -->
                <div class="py-0">
                    <?php the_posts_navigation(); ?>
                </div>
            </div>
        </div>
    <?php else : ?>
        <p><?php _e('No processes found.', 'obatala'); ?></p>
    <?php endif; ?>
</div>

<?php get_footer(); ?>
