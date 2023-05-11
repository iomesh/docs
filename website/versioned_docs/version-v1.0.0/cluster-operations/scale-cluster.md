---
id: version-v1.0.0-scale-cluster
title: Scale Cluster
sidebar_label: Scale Cluster
original_id: scale-cluster
---

You can scale the IOMesh cluster online without interrupting services. Before scaling the IOMesh cluster, consider the following:

- Scaling is only supported for IOMesh Enterprise Edition. The number of meta or chunk pods in IOMesh Community Edition is limited to 3.
- Add worker nodes to the Kubernetes cluster before increasing the number of chunk or meta pods. The number of worker nodes needed depends on how many chunk or meta pods you want to add, as each worker node can only have 1 meta pod and 1 chunk pod.

## Scale Up Chunk Server

If storage capacity is insufficient or storage usage exceeds 80%, you should add the number of chunk pods. 

**Precaution**

The minimum number of chunk pods is 3, and the maximum number depends on the IOMesh Enterprise Edition node limit, which can be up to 255.

**Procedure**
1. Find `chunk` in `iomesh.yaml`, the default configuration file exported during IOMesh installation, and then edit `replicaCount`.
    ```yaml
    chunk:
      replicaCount: 5 # Enter the number of chunk pods.
    ```
2. Apply the modification.
    
    ```shell
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh.yaml
    ```
3. Verify that the modification was successful.
    
    ```shell
    kubectl get pod -n iomesh-system | grep chunk
    ```   
   
   If successful, you should see output like this:
    ```output
    iomesh-chunk-0                                         3/3     Running   0          5h5m
    iomesh-chunk-1                                         3/3     Running   0          5h5m
    iomesh-chunk-2                                         3/3     Running   0          5h5m
    iomesh-chunk-3                                         3/3     Running   0          5h5m
    iomesh-chunk-4                                         3/3     Running   0          5h5m
    ```

## Scale Down Chunk Server

**Precautions**

- You can only remove 1 chunk pod at a time.
- Remove chunk pods in reverse creation order. Each chunk pod is uniquely numbered by `StatefulSet` when created. For instance, if there are 3 chunk pods `iomesh-chunk-0`, `iomesh-chunk-1`, and `iomesh-chunk-2`, begin by removing `iomesh-chunk-2`. 

**Procedure**

The following example reduces the number of chunk pods by removing `iomesh-chunk-2` on the node `k8s-worker-2`.

1. Run the `ip a` command on the `k8s-worker-2` node to obtain the unique IP within the data CIDR. Assume the IP is `192.168.29.23`.

2. Run the following command. Locate the `status.summary.chunkSummary.chunks` field and find the ID of `chunks` whose IP is `192.168.29.23`.
    ```shell
    kubectl get iomesh iomesh -n iomesh-system -o yaml
    ```
    ```yaml
    chunks:
    - id: 2 # The chunk ID.
      ip: 192.168.29.23
    ```

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

5. Perform `chunk unregister`. Replace <chunk_id> with the chunk ID obtained from Step 2. 

    Depending on the size of the data in the chunk, executing this command can take from a few minutes to several hours.
    ```
    /opt/iomesh/iomeshctl chunk unregister <chunk_id>
    ```

6. Find `chunk` in `iomesh.yaml`, the default configuration file exported during IOMesh installation, and then edit `replicaCount`.
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
    If successful, you should see output like this:
    ```output
    iomesh-chunk-0                                         3/3     Running   0          5h5m
    iomesh-chunk-1                                         3/3     Running   0          5h5m
    ```

9. Run the following command. Then locate the `status.summary.chunkSummary.chunks` field to verify that the chunk was removed.
    ```shell
    kubectl get iomesh iomesh -n iomesh-system -o yaml
    ```
## Scale Up Meta Server

For a Kubernetes cluster with 4 nodes or fewer, there is no need to scale the meta server. However for a cluster with 5 or more nodes, it is recommended to increase the number of meta pods from 3 to 5.

**Precaution**

The minimum number of meta pods is 3 and the maximum is 5.

**Procedure**

1. Find `meta` in `iomesh.yaml`, the default configuration file exported during IOMesh installation, and then edit `replicaCount`.

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

    If successful, you should see output like this:
    ```output
    iomesh-meta-0                                         2/2     Running   0          5h5m
    iomesh-meta-1                                         2/2     Running   0          5h5m
    iomesh-meta-2                                         2/2     Running   0          5h5m
    iomesh-meta-3                                         2/2     Running   0          5h5m
    iomesh-meta-4                                         2/2     Running   0          5h5m
    ```

