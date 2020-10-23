---
id: deployment
title: ZBS Operator Deployment
sidebar_label: Deployment
---

This page will show you how to deploy ZBS Operator and ZBS clusters in Kubernetes.

## Prerequisite

- Kubernetes v1.17 or higher, check [Compatibility list](https://iomesh.com/docs/zbs-operator/overview#compatibility-list-with-kubernetes)
- Helm 3



## ZBS Operator Installation

Before you deploy ZBS cluster, you should deploy ZBS Operator first. ZBS Operator will watch-and-list ZBS MetaCluster and ZBS ChunkCluster CR. When CR changes, ZBS Operator will perform some corresponding operations, such as deployment/uninstallation/scaling, etc.

Follow the steps below to deploy a ZBS Operator.

1. Add [IOMesh Helm Repo][1]

    ```bash
    helm repo add iomesh iomesh.com/charts
    ```

2. Install zbs-operator chart

   NOTE: `my-zbs-operator` is release name, maybe you want to modify it.
   
   ```bash
   helm install --namespace iomesh-system --create-namespace iomesh-system my-zbs-operator iomesh/zbs-operator --version 0.1.0
   ```
   
3. Check your installation and wait for zbs-operator pods all ready

    ```bash
    watch kubectl get -n iomesh-system pods
    ```


[1]: http://iomesh.com/charts



## ZBS Installation

Follow the steps below to deploy a ZBS cluster.

1. Check ZBS chart's `values.yaml`, modify it in the way you expect.
    ```bash
    helm show values iomesh/zbs > zbs-values.yaml
    ```

    ```output
    # Default values for zbs
    
    suspend: false
    storageClass: hostpath
    volumeReclaimPolicy: Delete
    
    nameOverride: ""
    fullnameOverride: ""
    
    meta:
      replicaCount: 3
      image:
        repository: registry.iomesh.com/zbs/metad
        pullPolicy: IfNotPresent
        tag: ""
    
    chunk:
      replicaCount: 1
      image:
        repository: registry.iomesh.com/zbs/chunkd
        pullPolicy: IfNotPresent
        tag: ""
    
    redirector:
      image:
        repository: registry.iomesh.com/zbs/iscsi-redirectord
        pullPolicy: IfNotPresent
        tag: ""
    ```


3. Install ZBS chart

   ```bash
   helm install --namespace <namespace> --create-namespace iomesh/zbs -f zbs-values.yaml
   ```

   Or with install ZBS chart with default `values.yaml`

   ```bash
   helm install --namespace <namespace> --create-namespace iomesh/zbs
   ```

4. Wait for ZBS Pods ready

   ```bash
   watch kubectl get pod -n <namespace>
   ```

5. ZBS needs to know which disks to used as a journal, cache or partition and which Chunk Server should own it.

   We can label some [Blockdevice][0] so that ZBS can identify and recognize them.

   First, check your [Blockdevices][0] in default namespace.

   ```bash
   kubectl get bd -A
   ```

   ```output
   NAMESPACE       NAME                                           NODENAME          SIZE          CLAIMSTATE   STATUS   AGE
   iomesh-system   blockdevice-7902030cca1639fa50c45d3e08521cb0   node2   10736352768   Unclaimed    Active   39s
   iomesh-system   blockdevice-8c6b3b463dfa243b1c786f3766b8d48f   node2   10736352768   Unclaimed    Active   39s
   iomesh-system   blockdevice-9371148e9858f1b9c9c04b61105c6783   node2   10736352768   Unclaimed    Active   39s
   ```

   Label some blockdevices for chunk.

   ```bash
   kubectl label bd -n iomesh-system <blockdevice-name> zbs.iomesh.com/provision-for=<chunk-pod-name>
   kubectl label bd -n iomesh-system <blockdevice-name> zbs.iomesh.com/provision-type=<provision-type>
   ```
   
   Chunk Pod name should like that: `<namespace>.<chunk-pod>`, for example `zbs.zbs-chunk-0`

   The following provision types are supported:
   
   - `journal`
   - `cache`
   - `paritition`
   
   [0]: https://docs.openebs.io/docs/next/ndm.html	"OpenEBS NDM"

For now you already have a ZBS Storage Cluster deployed.

If you want to use it to create [Kubernetes Persistent Volume](https://kubernetes.io/zh/docs/concepts/storage/persistent-volumes/), checkout our CSI driver: [zbs-csi-driver](http://iomesh.com/docs/zbs-csi-driver/overview).

