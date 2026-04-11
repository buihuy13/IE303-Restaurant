import type {
    Blog,
    BlogCreateRequest,
    BlogImageUploadResponse,
    BlogMessageResponse,
    BlogPageParams,
    BlogPageResponse,
    BlogUpdateRequest,
} from "@/types/blog.type";
import api from "../axios";

const toBackendPage = (page?: number) => Math.max(0, (page ?? 1) - 1);

const buildPageParams = (params?: BlogPageParams) => {
    const queryParams = new URLSearchParams();

    queryParams.set("page", toBackendPage(params?.page).toString());
    queryParams.set("size", (params?.size ?? 12).toString());

    if (params?.authorId) queryParams.set("authorId", params.authorId);

    const sort = params?.sort ?? "publishedAt,desc";
    const sortParams = Array.isArray(sort) ? sort : [sort];
    sortParams.forEach((value) => {
        if (value) queryParams.append("sort", value);
    });

    return queryParams.toString();
};

const withQuery = (path: string, params?: BlogPageParams) => `${path}?${buildPageParams(params)}`;

export const blogApi = {
    getBlogs: async (params?: BlogPageParams): Promise<BlogPageResponse> => {
        const response = await api.get<BlogPageResponse>(withQuery("/blogs", params));
        return response.data;
    },

    getDraftBlogs: async (params?: BlogPageParams): Promise<BlogPageResponse> => {
        const response = await api.get<BlogPageResponse>(withQuery("/blogs/drafts", params));
        return response.data;
    },

    getArchivedBlogs: async (params?: BlogPageParams): Promise<BlogPageResponse> => {
        const response = await api.get<BlogPageResponse>(withQuery("/blogs/archived", params));
        return response.data;
    },

    getBlogById: async (blogId: string): Promise<Blog> => {
        const response = await api.get<Blog>(`/blogs/${blogId}`);
        return response.data;
    },

    getBlogBySlug: async (slug: string): Promise<Blog> => {
        const response = await api.get<Blog>(`/blogs/slug/${slug}`);
        return response.data;
    },

    createBlog: async (blogData: BlogCreateRequest): Promise<Blog> => {
        const response = await api.post<Blog>("/blogs", blogData, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    },

    updateBlog: async (blogId: string, blogData: BlogUpdateRequest): Promise<Blog> => {
        const response = await api.put<Blog>(`/blogs/${blogId}`, blogData, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    },

    deleteBlog: async (blogId: string): Promise<BlogMessageResponse> => {
        const response = await api.delete<BlogMessageResponse>(`/blogs/${blogId}`);
        return response.data;
    },

    uploadImages: async (imageFiles: File | File[]): Promise<BlogImageUploadResponse> => {
        const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));

        const response = await api.post<BlogImageUploadResponse>("/blogs/images/upload", formData);
        return response.data;
    },
};
