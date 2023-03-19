---
id: setup-iomesh
title: Setting Up IOMesh
sidebar_label: Setting Up IOMesh
---

After IOMesh is installed, you should mount block devices, also disks, from the Kubernetes worker nodes onto the IOMesh cluster so that IOMesh can use them to provide storage. 

### Viewing Block Device Objects 
**Object** is a basic unit of Kubernetes resources, and in IOMesh, an individual block device can be viewed as a block device object. To mount block devices on IOMesh, you first need to know what block devices are available. 

IOMesh manages disks on Kubernetes worker nodes with OpenEBS [node-disk-manager(NDM)](https://github.com/openebs/node-disk-manager). When deploying IOMesh, BlockDevice CR will be created in the same NameSpace as the IOMesh cluster, and you can see block devices available for use in this NameSpace.

**Procedure**

1. Run the following command to get block devices.

    ```bash
    kubectl --namespace iomesh-system -o wide get blockdevice
    ```

   After running the command, you should see an example like:

    ```output
    NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
    blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   10m
    blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Unclaimed    Active   10m
    blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Unclaimed    Active   10m
    ```
 
    >**Note:**
    >
    > Ensure the field `FSTYPE` for each IOMesh block device is blank.
   
2. To get details of an individual block device, run the following command. Replace `<device_name>` with the block device name.

    ```shell
    kubectl --namespace iomesh-system -o yaml get blockdevice <device_name>
    ```

    After running the command, you should see an example like:

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

    You can view details of this block device by checking labels with `iomesh.com/bd-` created by IOMesh.

    | Label | Description |
    | --- | --- |
    | `iomesh.com/bd-devicePath` | Shows the device path on the worker node.|
    | `iomesh.com/bd-deviceType` | Shows if it is a disk or a partition.|
    | `iomesh.com/bd-driverType` | Shows the driver type, incluing HDD, SSD, NVMe.|
    | `iomesh.com/bd-serial` | Shows the disk serial number.|
    | `iomesh.com/bd-vendor` | Shows the disk vendor.|

### Mapping Block Devices
Device mapping is about filtering block devices that meet your requirements which are defined by the combination of the mount type and device selector and mounting them onto the IOMesh cluster.

**Procedure**

```yaml 哪个文件
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

1. 哪个文件）Specify the deployment mode and configure device selector. Once done, all block devices filtered by the selector will be mounted on the IOMesh cluster according to the deployment mode you specify.

    **Mount Type**
    |Deployment Mode|Mount Type|
    |---|---|
    |`hybrid`|Provides two mount types: `cacheWithJournal` and `dataStore`.  <p>`cacheWithJournal`：used for the performance layer of storage pool and **MUST** be a partitionable block device. Two partitions will be created: one for journal and the other for cache. Either SATA or NVMe SSD is recommended.</p>`dataStore`: used for the capacity layer of storage pool. Either SATA or SAS HDD is recommended.|
    |`allflash`|<p>Only provides one mount type `dataStoreWithJournal`. </p> `dataStoreWithJournal` is used for the capacity layer of storage pool. It **MUST** be a partitionable block device. Two partitions will be created: one for `journal` and the other for `dataStore`. Either `SATA` or `NVMe` SSD is recommended.|

    **Device Selector**
    |Parameter|Value|Description|
    |---|---|---|
    | <code>selector</code> | [metav1.LabelSelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta) | The label selector to list `BlockDevice` available for use.                     |
    | <code>exclude</code>  |[]string | The name list of `BlockDevice` which will be excluded from being mounted. |


    A deviceMap example for hybrid mode:

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

      A DeviceMap example for all-flash mode:
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

4. Run the following command to set it to `spec.chunk.deviceMap`. 

    ```bash
    kubectl edit --namespace iomesh-system iomesh # edit 啥
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
