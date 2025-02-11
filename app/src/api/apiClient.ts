const BASE_URL = 'https://anemoneframe.com/api';

const fetcher = async ({
    url,
    method,
    body,
    headers,
}: {
    url: string;
    method?: "GET" | "POST";
    body?: object | FormData;
    headers?: HeadersInit;
}) => {
    const options: RequestInit = {
        method: method ?? "GET",
        headers: headers
            ? headers
            : {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
    };

    if (method === "POST") {
        if (body instanceof FormData) {
            if (options.headers && typeof options.headers === 'object') {
                options.headers = Object.fromEntries(
                    Object.entries(options.headers as Record<string, string>)
                        .filter(([key]) => key !== 'Content-Type')
                );
            }
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
    }

    const response = await fetch(`${BASE_URL}${url}`, options);

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error: ", errorText);

        let errorMessage = "An error occurred.";
        try {
            const errorObj = JSON.parse(errorText);
            errorMessage = errorObj.message || errorMessage;
        } catch {
            errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
    }

    // 克隆响应以便可以多次读取
    const responseClone = response.clone();

    try {
        const data = await responseClone.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        // 如果 JSON 解析失败，返回原始文本
        const text = await response.text();
        return { response: text };
    }
};

export const apiClient = {
    sendMessage: (roleId: string, message: string) => {
        const formData = new FormData();
        const messageWithRole = `${message}\nroleId=${roleId}`;
        formData.append("text", messageWithRole);
        formData.append("user", "user");

        return fetcher({
            url: `/a6cd6712-4ad3-0396-8892-7bd297117635/message`,
            method: "POST",
            body: formData,
        });
    }
}; 