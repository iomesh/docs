---
id: scale-cluster
title: Scale IOMesh Cluster
sidebar_label: Scale IOMesh Cluster
---

> **Note:**
> 
>  Before configuring the number of Chunk or Meta pods, add worker nodes to the Kubernetes cluster. Each worker node can only host one Meta or Chunk pod, so determine the number of worker nodes based on the number of Chunk or Meta pods you want to add.

### Scaling Chunk Server

Add the number of chunk pods when storage is insufficient or storage usage exceeds 80%. The number of chunk pods is 1, you can increase to 3 for IOMesh Community Edition and to 255 to the maximum for IOMesh Enterprise Edition.

1. In `iomesh.yaml`, locate `chunk` and then edit `replicas`. 

    ```yaml
    chunk:
    replicas: 5 # Enter the value after scaling. Up to 3 for IOMesh Community and 255 for IOMesh Enterprise.
    ```
2. Apply modifications.
    
    ```shell
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh.yaml
    ```
3. Verify if modifications are successful.
    
    ```shell
    kubectl get pod -n iomesh-system | grep chunk
    ```   
   
   If modifications are successful, you should see an example like:
    ```output
    iomesh-chunk-0                                         2/2     Running   0          5h5m
    iomesh-chunk-1                                         2/2     Running   0          5h5m
    iomesh-chunk-2                                         2/2     Running   0          5h5m
    iomesh-chunk-3                                         2/2     Running   0          5h5m
    iomesh-chunk-4                                         2/2     Running   0          5h5m
    ```

### Scaling Meta Server

Add meta pods when the meta server is overloaded. The minimum number of meta pods is 3, you can only increase to 5 for IOMesh Enterprise.

1. In `iomesh.yaml`, locate `meta` and then edit `replicas`. 

    ```yaml
    meta:
    replicas: 5 # Enter the value after scaling. Up to 5 for IOMesh Community.
    ```
2. Apply modifications.
    ```shell
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh-values.yaml
    ```
3. Verify if modifications are successful.

    ```shell
    kubectl get pod -n iomesh-system | grep meta
    ```

    If scaling is successful, you should see an example like:
    ```output
    iomesh-meta-0                                         2/2     Running   0          5h5m
    iomesh-meta-1                                         2/2     Running   0          5h5m
    iomesh-meta-2                                         2/2     Running   0          5h5m
    iomesh-meta-3                                         2/2     Running   0          5h5m
    iomesh-meta-4                                         2/2     Running   0          5h5m
    ```
