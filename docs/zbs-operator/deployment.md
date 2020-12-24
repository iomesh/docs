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

### Prerequisite

- 100G filesystem per worker for hostpath-provisioner

Before you deploy ZBS cluster, you should deploy ZBS Operator first. ZBS Operator will watch-and-list ZBSCluster CR. When CR changes, ZBS Operator will perform some corresponding operations, such as deployment/uninstallation/scaling, etc.

### Get started
Follow the steps below to deploy a ZBS Operator.

1. Add [IOMesh Helm Repo][1]

```bash
helm repo add iomesh iomesh.com/charts
```

2. Prepare hostpath dir

ZBS Operator will deploy hostpath-provisioner who manages local storage in pvc/pv way.  ZBS Operator will use hostpath-provisioner'pv to deploy ZBS cluster.

```bash
# Execute the following commands on each worker node
mkdir -p /mnt/iomesh/hostpath
mount /dev/<formatted-partition> /mnt/iomesh/hostpath
```

NOTE: `append a fstab entry to /etc/fstab to persist hostpath's mount operation`

3. Install zbs-operator chart

NOTE: `my-zbs-operator` is release name, maybe you want to modify it.

```bash
helm install --namespace iomesh-system --create-namespace my-zbs-operator iomesh/zbs-operator --version 0.1.0 --set hostpath-provisioner.pvDir=/mnt/iomesh/hostpath
```

4. Check your installation and wait for zbs-operator pods all ready

```bash
watch kubectl get -n iomesh-system pods
```


[1]: http://iomesh.com/charts

## ZBS Installation

### Prerequisite

1. three kubernetes worker node or more
2. tow ssd (or ssd partition) or more
per worker for ZBS journal and cache
3. one hdd (or ssd / hdd partition) or more
per worker for ZBS partition
4. a data network interface per worker (at least 10Gb) for ZBS
5. a access network interface (at least 10Gb) for ZBS per worker if it is a Disaggregated deployment

### Get started

Follow the steps below to deploy a ZBS cluster.

1. Setup data network and access network.

In order not to affect the business network, ZBS Cluster needs an independent data network for data transmission, so you need to divide an independent network segment (`dataCIDR`) for the zbs chunk. Every data network interface has a data ip within `dataCIDR`.

If ZBS and computing nodes are deployed separately, then you also need to divide the access network segment (`accessCIDR`) and ensure that ZBS and computing nodes are under the same network segment.
Every access network interface has a access ip within `accessCIDR`.

2. Check ZBS chart's `zbs-values.yaml`, modify it in the way you expect.

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

3. Install ZBS chart

```bash
helm install --namespace <namespace> --create-namespace my-zbs iomesh/zbs -f zbs-values.yaml
```

Or with install ZBS chart with default `zbs-values.yaml`

```bash
helm install --namespace <namespace> --create-namespace my-zbs iomesh/zbs
```

4. Wait for ZBS Pods ready

```bash
watch kubectl get pod -n <namespace>
```

5. ZBS needs to know which disks to used as a journal, cache or partition and which Chunk Server should own it.

We can label some [Blockdevices][0] so that ZBS can identify and recognize them.

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
kubectl label bd -n iomesh-system <blockdevice-name> iomesh.com/provision-for=<chunk-pod-name>
kubectl label bd -n iomesh-system <blockdevice-name> iomesh.com/provision-type=<provision-type>
```
Chunk Pod name should like that: `<namespace>.<chunk-pod>`, for example `zbs.zbs-chunk-0`

The following provision types are supported:

- `journal`
- `cache`
- `paritition`

[0]: https://docs.openebs.io/docs/next/ndm.html	"OpenEBS NDM"

For now you already have a ZBS Storage Cluster deployed.

If you want to use it to create [Kubernetes Persistent Volume](https://kubernetes.io/zh/docs/concepts/storage/persistent-volumes/), checkout our CSI driver: [zbs-csi-driver](http://iomesh.com/docs/zbs-csi-driver/overview).

## ZBS Access

In disaggregated deployment, you need to install ZBS Accesss in the compute-kubernetes to access storage-kubernetes.

### ZBS Access Operator Installation

1. Check ZBS Access Operator chart's `values.yaml`, modify it in the way you expect.
```bash
helm show values iomesh/zbs-access-operator > values.yaml
```
```output
# values.yaml
replicaCount: 3

image:
  repository: iomesh/zbs-operator
  tag: v0.1.2
  pullPolicy: IfNotPresent
imagePullSecrets: []

nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

tolerations: []

affinity: {}
```
2. Install ZBS Access Operator

```bash
helm install -f values.yaml my-zbs-access-operator iomesh/zbs-access-operator --create-namespace -n iomesh-system
```

3. Wait For ZBS Access Operator pod ready

```bash
watch kubectl get -n iomesh-system pods
```

### ZBS Access Installation

1. Check ZBS Access chart's values.yaml, modify it in the way you expect.
```bash
helm show values iomesh/zbs-access > values.yaml
```

ZBS Access Operator will create a zbs-access service named `cr.Name` to access storage-kubernetes's ZBS.
There are two way to configure zbs-access service:

- auto: Automatically sync zbs-access's endpoints from storage-kubernetes

- manual: Manually set zbs-access's endpoints

<!--DOCUSAURUS_CODE_TABS-->
<!--auto-->
```yaml
sourceService:
  secret:
    # storage-kubernetes kube-apiserver host
    host:
    # storage-kubernetes kube-apiserver ca
    ca:
    # storage-kubernetes service account token that has get/list/watch service/endpoint permissions
    token:
  # storage-kubernetes zbs access service name
  name:
  # storage-kubernetes zbs access service namespace
  namespace:

iscsiDiscovery:
  replicas: 3
  image:
    repository: harbor.smartx.com/zbs/iscsi-redirectord
    tag: v5.0.0-rc5
    pullPolicy: IfNotPresent


probe:
  image:
    repository: iomesh/zbs-operator
    tag: v0.1.2
    pullPolicy: IfNotPresent
```
  <!--manual-->
```yaml
backendEndpointSubset:
  addresses:
  - # zbs access network ip
  ports:
  - name: iscsi
  # iscsi portal port eg. 3260
  port:
  # chunk data port eg. 10201
  - name: chunk-data
  port:
  # meta-proxy port eg. 10206
  - name: meta-proxy
  port:

iscsiDiscovery:
  replicas: 3
  image:
    repository: harbor.smartx.com/zbs/iscsi-redirectord
    tag: v5.0.0-rc5
    pullPolicy: IfNotPresent

probe:
  image:
  repository: iomesh/zbs-operator
  tag: v0.1.2
  pullPolicy: IfNotPresent
```
<!--END_DOCUSAURUS_CODE_TABS-->

2. Install ZBS Access
```bash
helm install -f ./values.yaml zbs-access iomesh/zbs-access --version 0.1.0 --create-namespace -n zbs-access
```

3. Wait for ZBS Access Ready
```bash
watch kubectl get -n zbs-access pods
```
```output
Every 2.0s: kubectl get -n zbs-access pods                                                                  Thu Dec 24 18:16:53 2020

NAME                                    READY   STATUS    RESTARTS   AGE
zbs-iscsi-discoverer-5cdcbf8cff-ch8nw   2/2     Running   0          2m30s
zbs-iscsi-discoverer-5cdcbf8cff-v8t7j   2/2     Running   0          2m30s
zbs-iscsi-discoverer-5cdcbf8cff-x9xjr   2/2     Running   0          2m30s
```
```bash
kubectl get svc -n zbs-access
```
```output
AME                   TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)                        AGE
zbs-access             ClusterIP   10.111.46.72   <none>        3260/TCP,10206/TCP,10201/TCP   3m42s
zbs-iscsi-discoverer   ClusterIP   10.99.170.12   <none>        3260/TCP                       3m42s
```

After installation, we can access ZBS iscsi storage.
```bash
# initiate discovery op to zbs-iscsi-discoverer:3260
iscsiadm -m discovery -p 10.234.2.1:3260 -t sendtargets -I default
```
```output
10.111.46.72:3260,1 iqn.2016-02.com.smartx:system:7a96095a-a179-47ab-baa7-fbb09306315e
```
```bash
# initiate login op to zbs-access:3260
# you may disable SELinux when login fails.
iscsiadm -m node -T iqn.2016-02.com.smartx:system:7a96095a-a179-47ab-baa7-fbb09306315e -p 10.111.46.72:3260 --login
```
```output
Loging in to [iface: default, target: iqn.2016-02.com.smartx:system:7a96095a-a179-47ab-baa7-fbb09306315e, portal: 10.111.46.72,3260] (multiple)
Login to [iface: default, target: iqn.2016-02.com.smartx:system:7a96095a-a179-47ab-baa7-fbb09306315e, portal: 10.111.46.72,3260] successful.
```
