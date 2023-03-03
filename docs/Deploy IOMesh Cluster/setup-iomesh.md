---
id: setup-iomesh
title: Setup IOMesh
sidebar_label: Setup IOMesh
---

## Setting Up IOMesh

Once IOMesh is installed, you should mount block devices (aka disks) from the Kubernetes worker nodes onto the IOMesh cluster so that IOMesh can use them to provide storage. 

### Viewing Block Device Objects 
**Object** is a basic unit of Kubernetes resources, and in IOMesh, an individual block device can be viewed as a block device object. To mount block devices on IOMesh, you first need to know what block devices are available. 

IOMesh manages disks of Kubernetes worker nodes by using OpenEBS's [node-disk-manager(NDM)](https://github.com/openebs/node-disk-manager). When deploying IOMesh, BlockDevice CR will be created in the same NameSpace as the IOMesh cluster, and block devices available for use can be seen in this NameSpace.

**Procedure**

1. Run the following command to get block devices.

   ```bash
   kubectl --namespace iomesh-system -o wide get blockdevice
   ```

   After running the command, you should see an example list below:
   ```output
   NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
   blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   10m
   blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Unclaimed    Active   10m
   blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Unclaimed    Active   10m
   ```
   >**Note:**
   >
   > The filesystem type should not be specified for IOMesh block devices, so make sure the field **FSTYPE** is blank.
   
2. To get details of an individual block device, run the following command. Replace `<device_name>` with the block device name.

   ```shell
   kubectl --namespace iomesh-system -o yaml get blockdevice <device_name>
   ```

After running the command, you should see an example below:
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

In this example, labels with `iomesh.com/bd-` are created by IOMesh and show you details of this block device.

| Field | Description |
| --- | --- |
| `iomesh.com/bd-devicePath` | Shows the device path on the worker node.|
| `iomesh.com/bd-deviceType` | Shows if it is a disk or a partition.|
| `iomesh.com/bd-driverType` | Shows the driver type, incluing HDD, SSD, NVMe.|
| `iomesh.com/bd-serial` | Shows the disk serial number.|
| `iomesh.com/bd-vendor` | Shows the disk vendor.|

### Device Mapping

Simply put, device mapping is about filtering block devices that meet requirements and then mounting them on the IOMesh cluster.

**Procedure**

1. In `iomesh.yaml`, locate the field `chunk/deviceMap` that specifies which block devices will be mounted onto the IOMesh cluster.

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
2. Specify the field `mount-type` according to the deployment mode.
   
   IOMesh provides support for two deployment modes: all-flash or hybrid.

   When selecting `hybrid`, configure the fields `cacheWithJournal` and `dataStore`. 

   - `cacheWithJournal`: used for the performance layer of storage pool. It **MUST** be a partitionable block device. Two partitions will be created: one for `journal` and the other for `cache`. Either `SATA` or `NVMe` SSD is recommended.
   - `dataStore`:  used for the capacity layer of storage pool. Either `SATA` or `SAS` HDD is recommended.

   When selecting `allflash`, configure the fields `cacheWithJournal` and `dataStore`.
   - `dataStoreWithJournal`: used for the capacity layer of storage pool. It **MUST** be a partitionable block device. Two partitions will be created: one for `journal` and the other for `dataStore`. Either `SATA` or `NVMe` SSD is recommended.

3. Configure the device selector to filter block devices.

   Device selector filters block devices by label and is defined by the combination of the field `selector` and `exclude`.

   | Name     | Type|Explain    |
   | -------- | -------- | ---- |
   | <code>selector</code> | [metav1.LabelSelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta) | label selector to list `BlockDevice`                     |
   | <code>exclude</code>  |[]string                                                     | name list of `BlockDevice` which will be excluded from mounting |

   All block devices selected by device selector will be mounted to IOMesh with the corresponding mount type.


   The following two examples shows the devicemap configuration in hybrid mode or all-flash mode.

      DeviceMap Configuration for Hybrid Mode
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

DeviceMap Example in All-Flash Deployment Mode
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

4. Run the following command to set it to `spec.chunk.deviceMap`. 运行这个命令来修改上面准备好的配置
  ```bash
    kubectl edit --namespace iomesh-system iomesh
  ```
5. Run the following command to verify that `STATUS` of `BlockDevice` you select becomes `Claimed`.
   ```bash
    kubectl --namespace iomesh-system -o wide get blockdevice
   ```

   After running the command, you should see an example below:

      ```output
      NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
      blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   11m
      blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Claimed      Active   11m
      blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Claimed      Active   11m
      ```
