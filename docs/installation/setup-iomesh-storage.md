---
id: setup-iomesh-storage
title: Setup IOMesh Storage
sidebar_label: Setup IOMesh Storage
---

Block devices on worker nodes are needed to be mounted to IOMesh cluster so that IOMesh could utilize them to construct and provide distributed storage service.

## Mount Block Devices

IOMesh Chunk Server need 2 kinds of block device for different usages:

- SSD for journals and caches
- HDD for dataStores

IOMesh uses `OpenEBS/BlockDevice` to manage disks attached to Kubernetes worker nodes. After `zbs-operator` is deployed, `BlockDevice` CRs will be appeared in the same namespace with IOMesh cluster.

```bash
kubectl --namespace iomesh-system -o wide get blockdevice
```
Examle output:

```bash
NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   10m
blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Unclaimed    Active   10m
blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Unclaimed    Active   10m
```

Using following commands for showing details of devices:

```shell
kubectl --namespace iomesh-system -o yaml get blockdevice <device_name>
```

Example output:

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

Labels started with `iomesh.com/bd-` are created by IOMesh to indicate hardware properties.

| Name | Describe |
| --- | --- |
| `iomesh.com/bd-devicePath` | the device path on node |
| `iomesh.com/bd-deviceType` | disk, loop, partition etc. |
| `iomesh.com/bd-driverType` | HDD, SSD, NVME |
| `iomesh.com/bd-serial` | disk serial |
| `iomesh.com/bd-vendor` | disk vendor |

`chunk/deviceMap` in `iomesh-values.yaml` is used to indicate which block devices should be mounted to IOMesh cluster and how they should be mounted.

```yaml
chunk:
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

### Mount Type

IOMesh now provides 2 mount types:

- `cacheWithJournal`: performance tier of storage pool. **MUST** ba a partitionable devcie. IOMesh will partition the device into 2 paritions 20 GiB for `journal` and the rest for `cache`.
- `dataStore`:  capacity tier of storage pool. Can be any type of device.

Device selector is defined by:

| Name     | Type                                                         | Explain                                                      |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| selector | [metav1.LabelSelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta) | the label selector to list `BlockDevice`                     |
| exclude  | []string                                                     | the name list of `BlockDevice` which want to exclude from previous selected objects |

> **_NOTE_: selector will auto add a `kubernetes.io/hostname` selection to only select disks on the same node with Chunk Server.**

Here is an example configuration:
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

After having a correct `chunk/deviceMap` configuration, apply it to cluster.

> **_NOTE_: replace `my-iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```
