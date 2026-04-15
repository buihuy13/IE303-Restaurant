import type {
    Blog,
    BlogComment,
    BlogCommentCreateRequest,
    BlogCommentPageResponse,
    BlogCreateRequest,
    BlogEditorialTemplate,
    BlogEditorialTemplateRenderRequest,
    BlogEditorialTemplateRenderResponse,
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
    if (params?.search) queryParams.set("search", params.search);
    if (params?.category) queryParams.set("category", params.category);
    if (params?.tag) queryParams.set("tag", params.tag);
    if (typeof params?.featured === "boolean") queryParams.set("featured", String(params.featured));

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

    getCategories: async (): Promise<string[]> => {
        const response = await api.get<string[]>("/blogs/categories");
        return response.data;
    },

    getTags: async (): Promise<string[]> => {
        const response = await api.get<string[]>("/blogs/tags");
        return response.data;
    },

    getEditorialTemplates: async (): Promise<BlogEditorialTemplate[]> => {
        const response = await api.get<BlogEditorialTemplate[]>("/blogs/editorial-templates");
        return response.data;
    },

    renderEditorialTemplate: async (
        key: string,
        payload: BlogEditorialTemplateRenderRequest,
    ): Promise<BlogEditorialTemplateRenderResponse> => {
        const response = await api.post<BlogEditorialTemplateRenderResponse>(
            `/blogs/editorial-templates/${key}/render`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
            },
        );
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

    getBlogComments: async (
        blogId: string,
        params?: Pick<BlogPageParams, "page" | "size" | "sort">,
    ): Promise<BlogCommentPageResponse> => {
        const response = await api.get<BlogCommentPageResponse>(withQuery(`/blogs/${blogId}/comments`, params));
        return response.data;
    },

    createBlogComment: async (blogId: string, payload: BlogCommentCreateRequest): Promise<BlogComment> => {
        const response = await api.post<BlogComment>(`/blogs/${blogId}/comments`, payload, {
            headers: { "Content-Type": "application/json" },
        });
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
