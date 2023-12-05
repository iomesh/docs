---
id: scale-out-cluster
title: Scale Out Cluster
sidebar_label: Scale Out Cluster
---

If you have the IOMesh Enterprise edition, you can scale out the cluster online without interrupting its operation. However, scaling out is not possible with the Community edition that only allows a maximum of three meta or chunk pods. When scaling out the cluster, you can choose to add chunk pods, meta pods, or both at the same time.

**Prerequisite**

Ensure an adequate number of worker nodes in the Kubernetes cluster. Each worker node can accommodate only one chunk pod and one meta pod. Therefore, if there are insufficient worker nodes, add them to the Kubernetes cluster before scaling out.

**Procedure**

1. Add chunk pods.
  
   >_NOTE_: A single IOMesh cluster should have a minimum of three chunk pods. The maximum number of chunk pods is determined jointly by the total number of worker nodes in the Kubernetes cluster and the node count specified in the IOMesh license, with a maximum of 255 for the Enterprise edition.
   
   To increase the capacity of the IOMesh cluster, you can choose to add chunk pods by following these steps:

   - Locate `chunk` in `iomesh.yaml`, the default configuration file exported during IOMesh installation. Then modify the value of `replicaCount`, which represents the total number of chunk pods.
  
      ```yaml
      chunk:
        replicaCount: 5 # Enter the number of chunk pods.
      ```
   - Apply the modification.
    
      ```shell
      helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh.yaml
      ```
   - Verify that the modification was successful.
    
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

2. Add meta pods. 
   
	 An optional step. When deploying IOMesh, three meta pods are created in the IOMesh cluster by default. If the number of IOMesh nodes in the Kubernetes cluster is equal to or greater than five, it's recommended to increase the number of meta pods from three to five. Note that the number of supported meta pods in the IOMesh cluster should be either three or five.

   - Locate `meta` in `iomesh.yaml`, the default configuration file exported during IOMesh installation. Then modify the value of `replicaCount`, which represents the number of meta pods.

      ```yaml
      meta:
        replicaCount: 5 # Change the value to 5.
      ```
   - Apply the modification.
      ```shell
      helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh.yaml
      ```
   - Verify that the modification was successful.

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

