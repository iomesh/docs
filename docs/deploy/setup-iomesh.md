---
id: setup-iomesh
title: Setup IOMesh
sidebar_label: Setup IOMesh
---

Block devices at worker nodes are needed to be mounted to IOMesh cluster so that IOMesh could utilize the devices to construct and provide distributed storage service.

By default, IOMesh doesn't mount any block devices. Users have to configure IOMesh manually after installing.

## Mount Block Devices

### Block Device Object

IOMesh uses OpenEBS's [node-disk-manager(NDM)](https://github.com/openebs/node-disk-manager) to manage disks attached to Kubernetes worker nodes. After IOMesh operator is deployed, `BlockDevice` CRs will be created in the same namespace with IOMesh cluster:

```bash
kubectl --namespace iomesh-system -o wide get blockdevice
```

```output
NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   10m
blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Unclaimed    Active   10m
blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Unclaimed    Active   10m
```

Use the following commands to show the details of a block device:

```shell
kubectl --namespace iomesh-system -o yaml get blockdevice <device_name>
```

```output
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
    iomesh.com/bd-vendor: ATA
    kubernetes.io/hostname: kind-control-plane
    ndm.io/blockdevice-type: blockdevice
    ndm.io/managed: "true"
  namespace: iomesh-system
  name: blockdevice-3fa2e2cb7e49bc96f4ed09209644382e
# ...
```

Labels started with `iomesh.com/bd-` are created by IOMesh to describe hardware properties:

| Name | Describe |
| --- | --- |
| `iomesh.com/bd-devicePath` | the device path on node |
| `iomesh.com/bd-deviceType` | disk, loop, partition etc. |
| `iomesh.com/bd-driverType` | HDD, SSD, NVME |
| `iomesh.com/bd-serial` | disk serial |
| `iomesh.com/bd-vendor` | disk vendor |

### Device Map

`chunk/deviceMap` in `iomesh-values.yaml` is used to indicate which block devices should be mounted to IOMesh cluster and how they would be mounted.

```yaml
spec:
  chunk:
    deviceMap:
      <mount-type>:
        selector:
          matchLabels:
            <label-key>: <label-value>
          matchExpressions:
          - key: <label-key>
            operator: In
            Values:
            - <label-value>
        exclude:
        - <block-device-name>
```

#### Mount Type

IOMesh provides 2 mount types now:

- `cacheWithJournal`: used for performance tier of storage pool. It **MUST** ba a partitionable block device. IOMesh will partition the device into 2 paritions: one for `journal` and another for `cache`. Either `SATA` or `NVMe` SSD is recommanded.
- `dataStore`:  used for capacity tier of storage pool. Either `SATA` or `SAS` HDD is recommanded.

#### Device Selector

Device selector is defined by:

| Name     | Type                                                         | Explain                                                      |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| selector | [metav1.LabelSelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta) | label selector to list `BlockDevice`                     |
| exclude  | []string                                                     | name list of `BlockDevice` which will be excluded from mounting |

All block devices selected by device selector will be mounted to IOMesh with the corresponding mount type.

#### Example

Here is a full example of `chunk/deviceMap` configurations:
```yaml
spec:
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

After having the correct `chunk/deviceMap` configurations, apply to the cluster.

> **_NOTE_: You may replace `my-iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

Now run `kubectl --namespace iomesh-system -o wide get blockdevice` to see that the state of `BlockDevice` we selected becomes `Claimed`

```bash
kubectl --namespace iomesh-system -o wide get blockdevice
```

```output
NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   11m
blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Claimed      Active   11m
blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Claimed      Active   11m
```