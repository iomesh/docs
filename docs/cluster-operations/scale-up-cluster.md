---
id: scale-up-cluster
title: Scale Up Cluster
sidebar_label: Scale Up Cluster
---

If you have the Enterprise Edition of IOMesh software, you can scale it up online without disrupting the cluster's operation. However, scaling up is not possible with the Community Edition, which limits the number of meta or chunk pods to three. During scaling up, you can choose to add chunk pods, meta pods, or both simultaneously.

**Prerequisite**

Ensure an adequate number of worker nodes in the Kubernetes cluster. Each worker node can accommodate only one chunk pod and one meta pod. Therefore, if there are insufficient worker nodes, add them to the Kubernetes cluster before scaling up.

**Procedure**

1. Add chunk pods.
  
   >_NOTE_: A single IOMesh cluster should have a minimum of three chunk pods. The maximum number of chunk pods is determined jointly by the total number of worker nodes in the Kubernetes cluster and the node count specified in the IOMesh license, with a maximum of 255 for the Enterprise edition.
   
   To increase the capacity of the IOMesh cluster, follow these steps to add chunk pods:

   - Find `chunk` in `iomesh.yaml`, the default configuration file exported during IOMesh installation, and then edit `replicaCount`. The value of `replicaCount` is the total number of chunk pods after scaling up.
  
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
   
	 When deploying IOMesh, three meta pods are created in the IOMesh cluster by default. If the number of IOMesh nodes in the Kubernetes cluster is equal to or greater than five, it's recommended to increase the number of meta pods from three to five. Note that the number of supported meta pods in the IOMesh cluster should be either three or five.

   - Find `meta` in `iomesh.yaml`, the default configuration file exported during IOMesh installation, and then edit `replicaCount`.

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

