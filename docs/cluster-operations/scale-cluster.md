---
id: scale-cluster
title: Scale Cluster
sidebar_label: Scale Cluster
---

Before scaling the IOMesh cluster, consider the following:

- Scaling is only supported for IOMesh Enterprise Edition. The number of meta or chunk pods in IOMesh Community Edition is limited to 3.
- Before increasing the number of chunk or meta pods, add worker nodes to the Kubernetes cluster. Each worker node can only have one meta pod and one chunk pod, so determine the number of worker nodes based on the number of chunk or meta pods you want to add.

## Scale Chunk Server

If storage capacity is insufficient or storage usage exceeds 80%, you should add the number of chunk pods. 

**Precaution**

The minimum number of chunk pods is 3, and the maximum number you can add depends on the IOMesh Enterprise Edition node limit, which can be up to 255.

**Procedure**

1. In `iomesh.yaml`, locate `chunk` and then edit `replicas`. 

    ```yaml
    chunk:
    replicas: "3" # Enter the number of chunk pods. 
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
    iomesh-chunk-0                                         2/2     Running   0          5h5m
    iomesh-chunk-1                                         2/2     Running   0          5h5m
    iomesh-chunk-2                                         2/2     Running   0          5h5m
    iomesh-chunk-3                                         2/2     Running   0          5h5m
    iomesh-chunk-4                                         2/2     Running   0          5h5m
    ```

## Scale Meta Server

Add meta pods when the meta server is overloaded. 

There is no need to scale the meta server if your Kubernetes cluster has no more than 4 worker nodes, as 

集群规模不超过四个节点时，无需 scale meta server，此时可以容忍集群中任意一个 meta server 故障；当集群规模大于或等于五个节点时，需将 meta server 从 3 个扩容到 5 个，此时可以容忍集群中任意两个 meta server 宕机。

**Precaution**

The minimum number of meta pods is 3 and the maximum is 5.

**Procedure**

1. In `iomesh.yaml`, locate `meta` and then edit `replicas`. 

    ```yaml
    meta:
    replicas: "3" # Enter the number of meta pods greater than 3 but less than 6. 
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
    iomesh-meta-0                                         2/2     Running   0          5h5m
    iomesh-meta-1                                         2/2     Running   0          5h5m
    iomesh-meta-2                                         2/2     Running   0          5h5m
    iomesh-meta-3                                         2/2     Running   0          5h5m
    iomesh-meta-4                                         2/2     Running   0          5h5m
    ```
