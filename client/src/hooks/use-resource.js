import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, createItem, deleteItem, getList, updateItem } from "../services/api.js";

export function useResource(path, params = {}) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: [path, params], queryFn: () => getList(path, params) });
  const refresh = () => { queryClient.invalidateQueries({ queryKey: [path] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); };
  const create = useMutation({ mutationFn: values => createItem(path, values), onSuccess: refresh });
  const update = useMutation({ mutationFn: ({ id, values }) => updateItem(path, id, values), onSuccess: refresh });
  const remove = useMutation({ mutationFn: id => deleteItem(path, id), onSuccess: refresh });
  const addNested = useMutation({
    mutationFn: ({ id, field, values }) => api.post(`/${path}/${id}/${field}`, values),
    onSuccess: refresh
  });
  const updateNested = useMutation({
    mutationFn: ({ id, field, nestedId, values }) => api.put(`/${path}/${id}/${field}/${nestedId}`, values),
    onSuccess: refresh
  });
  const removeNested = useMutation({
    mutationFn: ({ id, field, nestedId }) => api.delete(`/${path}/${id}/${field}/${nestedId}`),
    onSuccess: refresh
  });
  return { ...query, items: query.data?.items || [], create, update, remove, addNested, updateNested, removeNested };
}
