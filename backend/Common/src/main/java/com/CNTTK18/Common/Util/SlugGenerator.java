package com.CNTTK18.Common.Util;

import java.text.Normalizer;
import java.util.UUID;
import java.util.regex.Pattern;

public class SlugGenerator {
    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGES_HYPHENS = Pattern.compile("^-|-$");
    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    public static String generate(String name) {
        if (name == null || name.isEmpty()) {
            return "";
        }
        // Xóa các dấu cách 2 bên trước
        name = name.trim();

        // 1. Chuẩn hóa (Normalize) để tách dấu và chữ
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);

        // 2. Loại bỏ tất cả các dấu (diacritics)
        String withoutDiacritics = DIACRITICS.matcher(normalized).replaceAll("");

        // 3. Chuyển đổi đặc biệt chữ 'Đ' và 'đ'
        withoutDiacritics = withoutDiacritics.replaceAll("[đĐ]", "d");

        // 4. Thay thế khoảng trắng bằng gạch nối và chuyển sang chữ thường
        String slug = WHITESPACE.matcher(withoutDiacritics).replaceAll("-").toLowerCase();

        // 5. Loại bỏ tất cả các ký tự không hợp lệ
        slug = NON_LATIN.matcher(slug).replaceAll("");

        // 6. (Tùy chọn) Loại bỏ gạch nối ở đầu hoặc cuối
        slug = EDGES_HYPHENS.matcher(slug).replaceAll("");

        if (!slug.isEmpty()) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 5);
        }

        return slug;
    }
}
