---
id: scale-down-cluster
title: Scale Down Cluster
sidebar_label: Scale Down Cluster
---

You can scale down the IOMesh cluster by removing chunk pods in the Kubernetes worker nodes.

**Precautions**

- You can only remove one chunk pod at a time.
  
- Each chunk pod is uniquely numbered by `StatefulSet` when created, and you should remove them in reverse creation order. For example, if there are 5 chunk pods `iomesh-chunk-0`, `iomesh-chunk-1`, `iomesh-chunk-2`, `iomesh-chunk-3`, `iomesh-chunk-4`, deletion should start with `iomesh-chunk-4`.


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