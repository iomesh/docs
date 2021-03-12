---
id: setupiomeshstorage
title: Setup IOMesh Storage
sidebar_label: Setup IOMesh Storage
---

## Deploy IOMesh Cluster

Follow the steps below to deploy a IOMesh cluster.

1. Setup data network and access network.

In order not to affect the business network, IOMesh Cluster needs an independent data network for data transmission, so you need to divide an independent network segment (`dataCIDR`) for the IOMesh chunk. Every data network interface has a data ip within `dataCIDR`.

If IOMesh and computing nodes are deployed separately, then you also need to divide the access network segment (`accessCIDR`) and ensure that IOMesh and computing nodes are under the same network segment.
Every access network interface has a access ip within `accessCIDR`.

2. Check IOMesh chart's `zbs-values.yaml`, modify it in the way you expect.

```bash
helm show values iomesh/zbs > zbs-values.yaml
```

```output
# Default values for zbs

nameOverride: ""
fullnameOverride: ""

storageClass: hostpath
reclaimPolicy:
  volume: Delete
  blockdevice: Delete

meta:
  replicaCount: 3
  image:
    repository: harbor.smartx.com/zbs/metad
    pullPolicy: IfNotPresent
    tag: v5.0.0-rc5

chunk:
  replicaCount: 1
  dataCIDR: ""
  accessCIDR: ""
  image:
    repository: harbor.smartx.com/zbs/chunkd
    pullPolicy: IfNotPresent
    tag: v5.0.0-rc5
  devicemanager:
    image:
      repository: iomesh/zbs-operator
      pullPolicy: IfNotPresent
      tag: v0.1.2

redirector:
  image:
    repository: harbor.smartx.com/zbs/iscsi-redirectord
    pullPolicy: IfNotPresent
    tag: v5.0.0-rc5

probe:
  image:
    repository: iomesh/zbs-operator
    pullPolicy: IfNotPresent
    tag: v0.1.2

toolbox:
  image:
    repository: iomesh/zbs-operator-toolbox
    pullPolicy: IfNotPresent
    tag: v0.1.2
```

3. Install IOMesh chart

```bash
helm install --namespace <namespace> --create-namespace my-zbs iomesh/zbs -f zbs-values.yaml
```

Or with install IOMesh chart with default `zbs-values.yaml`

```bash
helm install --namespace <namespace> --create-namespace my-zbs iomesh/zbs
```

4. Wait for IOMesh Pods ready

```bash
watch kubectl get pod -n <namespace>
```

5. IOMesh needs to know which disks to used as a journal, cache or partition and which Chunk Server should own it.

We can label some [Blockdevices][0] so that IOMesh can identify and recognize them.

First, check your [Blockdevices][0] in all namespaces.

```bash
kubectl get bd -A
```

```output
NAMESPACE       NAME                                           NODENAME          SIZE          CLAIMSTATE   STATUS   AGE
iomesh-system   blockdevice-7902030cca1639fa50c45d3e08521cb0   node2   10736352768   Unclaimed    Active   39s
iomesh-system   blockdevice-8c6b3b463dfa243b1c786f3766b8d48f   node2   10736352768   Unclaimed    Active   39s
iomesh-system   blockdevice-9371148e9858f1b9c9c04b61105c6783   node2   10736352768   Unclaimed    Active   39s
```

Label some Blockdevices for chunk.

```bash
kubectl label bd -n iomesh-system <blockdevice-name> iomesh.com/provision-for=<chunk-pod-name>
kubectl label bd -n iomesh-system <blockdevice-name> iomesh.com/provision-type=<provision-type>
```

Chunk Pod name should like that: `<namespace>.<chunk-pod>`, for example `zbs.zbs-chunk-0`

The following provision types are supported:

- `journal`
- `cache`
- `partition`

[0]: https://docs.openebs.io/docs/next/ndm.html	"OpenEBS NDM"

For now you already have a IOMesh Storage Cluster deployed.

## Setup IOMesh Cluster VIP

1. Ensure that the Kubernetes cluster can connect to the IOMesh cluster over the Access Network.

2. Set IOMesh Cluster VIP

```shell
zbs-task vip set iscsi <zbs-cluster-vip>
```

