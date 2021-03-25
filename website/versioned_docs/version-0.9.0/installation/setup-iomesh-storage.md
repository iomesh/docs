---
id: version-0.9.0-setup-iomesh-storage
title: Setup IOMesh Storage
sidebar_label: Setup IOMesh Storage
original_id: setup-iomesh-storage
---

## Setup data network

In order not to affect the business network, IOMesh Cluster needs an independent data network for data transmission, so you need to divide an independent network segment (`dataCIDR`) for the IOMesh chunk. Every data network interface has a data ip within `dataCIDR`.

1. Export default config from chart

> **_NOTE_: If you already exported the config, you can skip this step.**

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Check IOMesh chart's `iomesh-values.yaml`, modify it in the way you expect.

```yaml
chunk:
  dataCIDR: "10.234.1.0/24" # change to your own data network cidr
```

3. Apply the IOMesh Cluster config

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

4. Check `my-iomesh-chunk-<num>` pods which in `CrashLoop` and remove them.

```bash
kubectl --namespace iomesh-system get pod
kubectl --namespace iomesh-system delete pod <crash-chunk-pod>
```

5. Wait for IOMesh Chunk pods ready

```bash
watch kubectl get pod --namespace iomesh-system
```

## Mount Device

IOMesh Chunk Server need 3 kind of device for different usage

- cache
- journal
- dataStore

IOMesh now use `OpenEBS/BlockDevice`  to manage the disks attached to the node. After deployed the `zbs-operator`, the `BlockDevice` will locate in the same namespace. (We use `iomesh-system` in the example)

1. Get BlockDevice
```bash
kubectl --namespace iomesh-system -o wide get blockdevice
```
_output:_
```bash
NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   10m
blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Unclaimed    Active   10m
blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Unclaimed    Active   10m
```

2. Check the labels of device you want to mount

```shell
kubectl --namespace iomesh-system -o yaml get blockdevice <device_name>
```

For example `blockdevice-3fa2e2cb7e49bc96f4ed09209644382e`

_output:_
```yaml
apiVersion: openebs.io/v1alpha1
kind: BlockDevice
metadata:
  annotations:
    internal.openebs.io/uuid-scheme: gpt
  generation: 1
  labels:
    iomesh.com/bd-devicePath: dev.sda
    iomesh.com/bd-deviceType: disk
    iomesh.com/bd-driverType: SSD
    iomesh.com/bd-serial: 24da000347e1e4a9
    iomesh.com/bd-vendor: SMARTX
    kubernetes.io/hostname: kind-control-plane
    ndm.io/blockdevice-type: blockdevice
    ndm.io/managed: "true"
  namespace: iomesh-system
  name: blockdevice-3fa2e2cb7e49bc96f4ed09209644382e
# ...
```

We can see some labels start with `iomesh.com/bd-` which fetched from `BlockDevice` 's spec.

| Name | Describe |
| --- | --- |
| `iomesh.com/bd-devicePath` | the device path on node |
| `iomesh.com/bd-deviceType` | disk, loop, partition etc. |
| `iomesh.com/bd-driverType` | HDD, SSD, NVME |
| `iomesh.com/bd-serial` | disk serial |
| `iomesh.com/bd-vendor` | disk vendor |

> **_Note_: To comply with the label rule of Kubernetes, we use dot (`.`) to replace slash (`/`) in the label value. For example, the label `iomesh.com/bd-devicePath`'s value `dev.sda` from previous result actually means `/dev/sda` on that node.**

3. Export default config `iomesh-values.yaml` from Chart

> **_NOTE_: If you already exported the config, you can skip this step.**

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

4. Edit `iomesh-values.yaml`

_Example:_
```yaml
# ...
chunk:
  # ...
  deviceMap:
    cacheWithJournal:
      selector:
        matchLabels:
          iomesh.com/bd-deviceType: disk
        matchExpressions:
        - key: iomesh.com/bd-driverType
          operator: In
          values: 
          - SSD
          - NVME
      exclude:
      - blockdevice-097b6628acdcd83a2fc6a5fc9c301e01
    dataStore:
      selector:
        matchExpressions:
        - key: iomesh.com/bd-driverType
          operator: In
          values:
          - HDD
      exclude:
      - blockdevice-097b6628acdcd83a2fc6a5fc9c301e01
  # ...
```

#### Mount Type

There are 4 mount type support

- `cacheWithJournal`: hot layer of the storage pool. **MUST** ba a re-partitionable devcie, the `devicemanager` will re-partition the device into 2 parition with ratio 90% for `cache` and 10% for `journal`, and max journal size is `10Gi`
- `dataStore`:  cold layer of the storage pool. Can be any type of device.
- `rawCache`: the `cache` part of the hot layer. Can be any type of device.
- `rawJournal`: the `journal` part of the hot layer. Can be any type of device.

#### deviceMap

The `deviceMap` is a key-value map under `chunk` node, the key is mount type and the value is device selector.

```yaml
deviceMap:
  <mount-type>:
    selector:
      matchLabels:
        foo: bar
      matchExpressions:
      - key: foo
        operator: In
        Values:
        - bar
    exclude:
    - blockdevice-demo-foo
```

device selector specification:

| Name     | Type                                                         | Explain                                                      |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| selector | [metav1.LabelSelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta) | the label selector to list `BlockDevice`                     |
| exclude  | []string                                                     | the name list of `BlockDevice` which want to exclude from previous selected objects |

> **_NOTE_: selector will auto add a `kubernetes.io/hostname` selection to only select disks on the same node with Chunk Server.**


5. Apply the IOMesh Cluster config

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

6. Check Disk Mounted

<!--TODO-->
