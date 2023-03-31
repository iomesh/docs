---
id: scale-cluster
title: Scale IOMesh Cluster
sidebar_label: Scale IOMesh Cluster
---

> **Note:**
> 
>  Before increasing the number of chunk or meta pods, add worker nodes to the Kubernetes cluster. Each worker node can only host one meta or chunk pod, so determine the number of worker nodes based on the number of chunk or meta pods you want to add.

## Scale Chunk Server

If storage capacity is insufficient or storage usage exceeds 80%, you should add the number of chunk pods. The minimum number of chunk pods i

**Precaution**

The number of chunk pods depends on the IOMesh edition.
- **Community**：At least 1 chunk pod and up to 3.
- **Enterprise**: At least 1 chunk pod and up to 255.

**Procedure**

1. In `iomesh.yaml`, locate `chunk` and then edit `replicas`. 

    ```yaml
    chunk:
    replicas: "" # Enter the number of chunk pods. 
    ```
2. Apply the modification.
    
    ```shell
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh.yaml
    ```
3. Verify that the modification was successful.
    
    ```shell
    kubectl get pod -n iomesh-system | grep chunk
    ```   
   
   If successful, you should see an example like:
    ```output
    iomesh-chunk-0                                         2/2     Running   0          5h5m
    iomesh-chunk-1                                         2/2     Running   0          5h5m
    iomesh-chunk-2                                         2/2     Running   0          5h5m
    iomesh-chunk-3                                         2/2     Running   0          5h5m
    iomesh-chunk-4                                         2/2     Running   0          5h5m
    ```

## Scale Meta Server

Add meta pods when the meta server is overloaded. 

**Precaution**

Increasing the number of meta pods is not supported for IOMesh Community Edition. For the Enterprise Edition, the minimum number of meta pods is 3 and the maximum number is 5.

1. In `iomesh.yaml`, locate `meta` and then edit `replicas`. 

    ```yaml
    meta:
    replicas: "" # Enter an integer greater than 3 but less than 6. 
    ```
2. Apply the modification.
    ```shell
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh-values.yaml
    ```
3. Verify that the modification was successful.

    ```shell
    kubectl get pod -n iomesh-system | grep meta
    ```

    If successful, you should see an example like:
    ```output
    iomesh-meta-0                                         2/2     Running   0          5h5m
    iomesh-meta-1                                         2/2     Running   0          5h5m
    iomesh-meta-2                                         2/2     Running   0          5h5m
    iomesh-meta-3                                         2/2     Running   0          5h5m
    iomesh-meta-4                                         2/2     Running   0          5h5m
    ```
