---
id: scale-cluster
title: Scale Cluster
sidebar_label: Scale Cluster
---

You can scale the IOMesh cluster online without interrupting services. Before scaling the IOMesh cluster, consider the following:

- Scaling is only supported for IOMesh Enterprise Edition. The number of meta or chunk pods in IOMesh Community Edition is limited to 3.
- Add worker nodes to the Kubernetes cluster before increasing the number of chunk or meta pods. The number of worker nodes needed depends on how many chunk or meta pods you want to add, as each worker node can only have one meta pod and one chunk pod.

## Scale Up Chunk Server

If storage capacity is insufficient or storage usage exceeds 80%, you should add the number of chunk pods. 

**Precaution**

The minimum number of chunk pods is 3, and the maximum number you can add depends on the IOMesh Enterprise Edition node limit, which can be up to 255.

**Procedure**

1. In `iomesh.yaml`, locate `chunk` and then edit `replicaCount`. 
    ```yaml
    chunk:
      replicaCount: 3 # Enter the number of chunk pods.
    ```
2. Apply the modification.
    
    ```shell
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh.yaml
    ```
3. Verify that the modification was successful.
    
    ```shell
    kubectl get pod -n iomesh-system | grep chunk
    ```   
   
   If successful, you should see output below:
    ```output
    iomesh-chunk-0                                         3/3     Running   0          5h5m
    iomesh-chunk-1                                         3/3     Running   0          5h5m
    iomesh-chunk-2                                         3/3     Running   0          5h5m
    iomesh-chunk-3                                         3/3     Running   0          5h5m
    iomesh-chunk-4                                         3/3     Running   0          5h5m
    ```

## Scale Down Chunk Server

**Precaution**

statefulset 会给每个 chunk pod 分配唯一的编号，并按编号顺序创建 chunk pod，当 chunk pod 数量为 3 时，chunk pod 的创建顺序为：iomesh-chunk-0，iomesh-chunk-1，iomesh-chunk-2。缩容操作必须保持与创建顺序相反，后续的操作示例以缩容 iomesh-chunk-2 为例，You can only reduce 1 chunk pod at a time.

**Procedure**

1. 确认 iomesh-chunk-2 pod 的存储网 ip 地址。假设 iomesh-chunk-2 运行在 k8s-worker-2 这个节点上，在 k8s-worker-2 上通过 `ip a` 命令找到属于 DATA_CIDR 的唯一 ip 地址，假设为 192.168.29.23

2. Run the following command. Locate the `status.summary.chunkSummary.chunks` field and find the chunk id which ip equal 192.168.29.23.
    ```shell
    kubectl edit iomesh iomesh -n iomesh-system
    ```
    ```yaml
    chunks:
    - id: 2
      ip: 192.168.29.23
    ```
in this example, chunk id is 2.

3. Get the meta leader pod name.
    ```shell
    kubectl get pod -n iomesh-system -l=iomesh.com/meta-leader -o=jsonpath='{.items[0].metadata.name}'
    ```
    ```output
    iomesh-meta-0
    ```

4. Access the meta leader pod.
    ```shell
    kubectl exec -it iomesh-meta-0 -n iomesh-system -c iomesh-meta bash
    ```

5. Perform `chunk unregister`. Replace <chunk_id> with the chunk ID obtained from Step 2. 根据 chunk 中数据容量大小，这个命令可能会执行几分钟到数小时 
    ```
    /opt/iomesh/iomeshctl chunk unregister <chunk_id>
    ```

6. In `iomesh.yaml`, locate `chunk` and then edit `replicaCount`. 
    ```yaml
    chunk:
      replicaCount: 3 # Reduce the value to 2. 
    ```

7. Apply the modification.
    
    ```shell
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh.yaml
    ```

8. Verify that the number of chunk pods is reduced.
    
    ```shell
    kubectl get pod -n iomesh-system | grep chunk
    ```   
    If successful, you should see output below:
    ```output
    iomesh-chunk-0                                         3/3     Running   0          5h5m
    iomesh-chunk-1                                         3/3     Running   0          5h5m
    ```

9. Run the following command. Then locate the `status.summary.chunkSummary.chunks` field to verify that the chunk was removed.
    ```shell
    kubectl edit iomesh iomesh -n iomesh-system
    ```
## Scale Up Meta Server

For a Kubernetes cluster with 4 nodes or fewer, there is no need to scale the meta server. However for a cluster with 5 or more nodes, it is recommended to increase the number of meta pods from 3 to 5.

**Precaution**

The minimum number of meta pods is 3 and the maximum is 5.

**Procedure**

1. In `iomesh.yaml`, locate `meta` and then edit `replicaCount`. 

    ```yaml
    meta:
      replicaCount: 5 # Change the value to 5.
    ```
2. Apply the modification.
    ```shell
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh.yaml
    ```
3. Verify that the modification was successful.

    ```shell
    kubectl get pod -n iomesh-system | grep meta
    ```

    If successful, you should see output below:
    ```output
    iomesh-meta-0                                         3/3     Running   0          5h5m
    iomesh-meta-1                                         3/3     Running   0          5h5m
    iomesh-meta-2                                         3/3     Running   0          5h5m
    iomesh-meta-3                                         3/3     Running   0          5h5m
    iomesh-meta-4                                         3/3     Running   0          5h5m
    ```

