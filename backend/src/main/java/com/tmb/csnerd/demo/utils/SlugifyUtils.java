package com.tmb.csnerd.demo.utils;

import com.github.slugify.Slugify;

public class SlugifyUtils {
    public static String slugify(String text) {
        final Slugify slg = Slugify.builder().build();
        return slg.slugify(text);
    }
}
