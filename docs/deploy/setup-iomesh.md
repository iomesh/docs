---
id: setup-iomesh
title: Setup IOMesh
sidebar_label: Setup IOMesh
---


## Setting Up IOMesh

Once IOMesh is installed, you should mount block devices (aka disks) on the Kubernetes worker node onto the IOMesh cluster so that IOMesh can use these storage resources to deliver storage services. 

### Viewing Block Device Objects 
**Object** is a basic unit of Kubernetes resources, and in IOMesh, a specific block device can be viewed as a block device object. To mount block devices onto IOMesh, you first need to know what block devices are available and their details.  

IOMesh manages disks on Kubernetes worker nodes by using OpenEBS's [node-disk-manager(NDM)](https://github.com/openebs/node-disk-manager). When deploying IOMesh, BlockDevice CR will be created at the same time in the same NameSpace as the IOMesh cluster, in which NameSpace you can see block devices available for use.

Run the command below to get block devices.

```bash
kubectl --namespace iomesh-system -o wide get blockdevice
```

After running the command, you will see a list as shown below:
```output
NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   10m
blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Unclaimed    Active   10m
blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Unclaimed    Active   10m
```
>**Note:**
>
> The block devices used by IOMesh should not contain any existing filesystem. Make sure the field **FSTYPE** of the block device is blank.


To get details of a specific block device, run the command below:

```shell
kubectl --namespace iomesh-system -o yaml get blockdevice <device_name>
```

After running the command, you should see:
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

Labels with `iomesh.com/bd-` are created by IOMesh to show hardware properties. For detailed information, refer to the table below:

| Filed | Description |
| --- | --- |
| `iomesh.com/bd-devicePath` | Shows the device path on the worker node.|
| `iomesh.com/bd-deviceType` | Shows if it is a disk or a partition.|
| `iomesh.com/bd-driverType` | Shows the driver type, incluing HDD, SSD, NVMe.|
| `iomesh.com/bd-serial` | Shows the disk serial number.|
| `iomesh.com/bd-vendor` | Shows the disk vendor.|

获取、查看块设备的详细信息

### Mounting Block Device to IOMesh Cluster

### Device Map （挂载块设备到 IOMesh cluster)

`chunk/deviceMap` in `iomesh.yaml` is used to indicate which block devices should be mounted to IOMesh cluster and how they would be mounted.

筛选的逻辑：筛选任意一个块设备


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
In `hybrid-flash` deployment mode, IOMesh provides two mount types:

- `cacheWithJournal`: used for performance tier of storage pool. It **MUST** be a partitionable block device. Two partitions will be created: one for `journal` and the other for `cache`. Either `SATA` or `NVMe` SSD is recommended.
- `dataStore`:  used for capacity tier of storage pool. Either `SATA` or `SAS` HDD is recommended.

In `all-flash` deployment mode, IOMesh only provides one mount type:

- `dataStoreWithJournal`: used for capacity tier of storage pool. It **MUST** be a partitionable block device. Two partitions will be created: one for `journal` and the other for `dataStore`. Either `SATA` or `NVMe` SSD is recommended.

#### Device Selector (筛选规则：通过 label 来筛选 device)

Device selector is defined by:

| Name     | Type                                                         | Explain                                                      |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| selector | [metav1.LabelSelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta) | label selector to list `BlockDevice`                     |
| exclude  | []string                                                     | name list of `BlockDevice` which will be excluded from mounting |

All block devices selected by device selector will be mounted to IOMesh with the corresponding mount type.

#### Example of DeviceMap Configuration in Hybrid-Flash Deployment Mode
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

#### Example of DeviceMap Configuration in All-Flash Deployment Mode
```yaml
spec:
  # ...
  chunk:
    # ...
    deviceMap:
      dataStoreWithJournal:
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
    # ...
```
> **_NOTE_: The blockdevice used by IOMesh should not contain any existing filesystem. Please ensure that the field `FSTYPE` output of the command `kubectl --namespace iomesh-system -owide get blockdevice` is empty.**

After having the correct deviceMap configurations, set it to `spec.chunk.deviceMap` by running `kubectl edit --namespace iomesh-system iomesh`, then run `kubectl --namespace iomesh-system -o wide get blockdevice` to verify that the state of `BlockDevice` we selected becomes `Claimed`

```bash
kubectl --namespace iomesh-system -o wide get blockdevice
```

```output
NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   11m
blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Claimed      Active   11m
blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Claimed      Active   11m
```
