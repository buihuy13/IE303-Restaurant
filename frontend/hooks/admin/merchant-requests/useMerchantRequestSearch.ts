import { useMemo, useState } from "react";
import type { User } from "@/types";

export function useMerchantRequestSearch(requests: User[]) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRequests = useMemo(
        () =>
            requests.filter(
                (request) =>
                    request.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.email.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [requests, searchTerm],
    );

    return { searchTerm, setSearchTerm, filteredRequests };
}
