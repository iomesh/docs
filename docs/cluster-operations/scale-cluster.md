---
id: scale-cluster
title: Scale Cluster
sidebar_label: Scale Cluster
---

You can scale the IOMesh cluster online without interrupting services. Before scaling the IOMesh cluster, consider the following:

- Scaling is only supported for IOMesh Enterprise Edition. The number of meta or chunk pods in IOMesh Community Edition is limited to 3.
- Add worker nodes to the Kubernetes cluster before increasing the number of chunk or meta pods. The number of worker nodes needed depends on how many chunk or meta pods you want to add, as each worker node can only have one meta pod and one chunk pod.

## Scale Chunk Server

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
    iomesh-chunk-0                                         2/2     Running   0          5h5m
    iomesh-chunk-1                                         2/2     Running   0          5h5m
    iomesh-chunk-2                                         2/2     Running   0          5h5m
    iomesh-chunk-3                                         2/2     Running   0          5h5m
    iomesh-chunk-4                                         2/2     Running   0          5h5m
    ```

## Scale Meta Server

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
    iomesh-meta-0                                         2/2     Running   0          5h5m
    iomesh-meta-1                                         2/2     Running   0          5h5m
    iomesh-meta-2                                         2/2     Running   0          5h5m
    iomesh-meta-3                                         2/2     Running   0          5h5m
    iomesh-meta-4                                         2/2     Running   0          5h5m
    ```
