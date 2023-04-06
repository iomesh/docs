---
id: localpv-manager
title: IOMesh LocalPV Manager
sidebar_label: IOMesh LocalPV Manager
---

## Introduction

### What is IOMesh LocalPV Manager

IOMesh LocalPV Manager is a CSI driver for managing local storage on the Kubernetes worker nodes. Stateful applications themselves such as [Minio](https://min.io/) and [TiDB](https://github.com/pingcap/tidb) achieves data high availability at the application layer. However, IOMesh PV adds an additional replication layer in the data path due to its own multi-replication policy setting, which may cause some degree of performance degradation and space waste. To avoid this issue, IOMesh local PV offers an advantage since it allows for creating PVs using local storage like a directory or block device for pod use.

IOMesh LocalPV Manager has the following advantages compared to [Kubernetes HostPath Volume](https://kubernetes.io/docs/concepts/storage/volumes/#hostpath) and [Kubernetes native local PV](https://kubernetes.io/docs/concepts/storage/volumes/#local):

- Dynamically provision PVs by using StorageClass and PVC to allow flexible storage access, without requiring administrators to pre-provision static PVs.

- Create PVs using a directory or block device, providing more flexibility than Kubernetes local PVs limited to the directory.

- Enable the capacity limit for PVs when using a directory as local storage.

### Architecture

![IOMesh LocalPV Manager](https://user-images.githubusercontent.com/12667277/217775597-7261e106-1407-4adf-92df-a1c99e447273.svg)

IOMesh LocalPV Manager is comprised of components: Controller Driver, Node Driver, and Node Disk Manager.

**Controller Driver** 

Implemented as a standard CSI controller server. With one instance on each worker node, it interacts with `kube-apiserver` for the creation and deletion of LocalPVs and the mapping of PVs to local directories or block devices.

**Node Driver** 

Implemented as a standard CSI node server. With one instance on each worker node, its main task is to interact with `kubelet` to mount and format local PVs.

**Node Disk Manager**

A component for discovering block devices and transforming them to block device objects, and providing a BlockDeviceClaim to ensure that a block device is exclusive to a particular Pod.

## Deployment

IOMesh LocalPV Manager will be automatically installed during IOMesh installation. To see the status of the IOMesh LocalPV Manager pod, run the following command:

```shell
kubectl get pod -n iomesh-system | grep localpv-manager
```
```output
NAME                                                           READY   STATUS             RESTARTS   AGE
iomesh-localpv-manager-rjg8j                                   4/4     Running            0          10s
iomesh-localpv-manager-vphz9                                   4/4     Running            0          10s
iomesh-localpv-manager-w4j8m                                   4/4     Running            0          10s
```

## IOMesh Hostpath LocalPV

IOMesh LocalPV Manager offers two types of volumes: `HostPath` and `Device`. IOMesh HostPath Local PV supports creating PV from a directory on a node and enabling the capacity limit for a PV, while IOMesh Device Local PV allows for PV creation using a block device for pod use. When selecting the volume type for your applications and databases, consider whether they require exclusive use of a disk or mounting a raw block device. If so, select the IOMesh Device Local PV. If this is not a requirement, choose the IOMesh Hostpath local PV instead. 

### Create HostPath Local PV

**Procedure**

1. When IOMesh LocalPV Manager is deployed, a default StorageClass will be created as shown below with `volumeType` set to `hostPath`. 

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: iomesh-localpv-manager-hostpath
      parameters:
    volumeType: hostpath
    basePath: /var/iomesh/local
    enableQuota: "false" # To enable PV capacity limit, set it to `true`.
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
    | Field | Description  |
    | ------- | ---- |
    | `parameters.volumeType`  | Local PV type, either `hostpath` or `device`. Set the field to `hostpath` for the IOMesh HostPath local PV.|
    | `parameters.basePath`    | The directory on which local PV will created. If `parameters.basePath` is not specified, the system will create a directory by default. Note that <strong> the value for `parameters.basePath` must be a fullpath.</strong> |
    | `parameters.enableQuota` | Shows whether capacity limit is enabled for this local PV, which defaults to `false`. |
    | [`volumeBindingMode`](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode)    | Volume binding mode, which only supports `WaitForFirstConsumer`.| 

    You may also create a StorageClass with the above content and configure `basePath` and `enableQuota` as needed.

2. Create a PVC. 

    - Create a YMAL config `iomesh-localpv-hostpath-pvc.yaml` with the following content.
        ```yaml
        kind: PersistentVolumeClaim
        apiVersion: v1
        metadata:
        name: iomesh-localpv-hostpath-pvc
        spec:
        storageClassName: iomesh-localpv-manager-hostpath
        accessModes:
            - ReadWriteOnce
        resources:
            requests:
            storage: 2G
        ```
    - Apply the YAML config to create the PVC.
        ```shell
        kubectl apply -f iomesh-localpv-hostpath-pvc.yaml
        ```

    - View the PVC.
        ```shell
        kubectl get pvc iomesh-localpv-hostpath-pvc
        ```
      You will see the PVC in the `Pending` state because `volumeBindingMode` in its StorageClass has been configured as `WaitForFirstConsumer`. When this PVC is bound to a pod, the corresponding PV will be created on the node where the pod resides, and at this time, the PVC will be in the `Bound` state.

        ```shell
        NAME                          STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS               AGE
        iomesh-localpv-hostpath-pvc   Pending                                      localpv-manager-hostpath   1m12s
        ```
3. Create a pod and bind it to the PVC created in Step 2.

    - Create a YAML config `iomesh-localpv-hostpath-pod.yaml` with the following content, which will mount the PVC to the `/mnt/iomesh/localpv` directory of this pod.
        ```yaml
        apiVersion: v1
        kind: Pod
        metadata:
        name: iomesh-localpv-hostpath-pod
        spec:
        volumes:
        - name: iomesh-localpv-hostpath
            persistentVolumeClaim:
            claimName: iomesh-localpv-hostpath-pvc
        containers:
        - name: busybox
            image: busybox
            command:
            - sh
            - -c
            - 'while true; do sleep 30; done;'
            volumeMounts:
            - mountPath: /mnt/iomesh/localpv 
            name: iomesh-localpv-hostpath
        ```
    - Apply the YAML config to create the pod.
    
        ```shell
        kubectl apply -f iomesh-localpv-hostpath-pod.yaml
        ```
    - Verify that the pod is in the `Running` state.

        ```shell
        kubectl get pod iomesh-localpv-hostpath-pod
        ```

    - Verify that the PVC is in `Bound` state and its corresponding PV was created.
        ```shell
        kubectl get pvc iomesh-localpv-hostpath-pvc
        ```
        ```output
        NAME                          STATUS   VOLUME                                     CAPACITY   ACCESS MODES     
        iomesh-localpv-hostpath-pvc   Bound    pvc-ab61547e-1d81-4086-b4e4-632a08c6537b   2G         RWO           
        ```

    - Get the YAML config to see PV configurations. Replace `pvc-ab61547e-1d81-4086-b4e4-632a08c6537b` with the PV name obtained in the previous step. 
        ```shell
        kubeclt get pv pvc-ab61547e-1d81-4086-b4e4-632a08c6537b -o yaml
        ```
        ```yaml
        apiVersion: v1
        kind: PersistentVolume
        metadata:
        ...
        spec:
        ...
        csi:
            driver: com.iomesh.iomesh-localpv-manager
            volumeAttributes:
            basePath: /var/iomesh/local
            csi.storage.k8s.io/pv/name: pvc-ab61547e-1d81-4086-b4e4-632a08c6537b
            csi.storage.k8s.io/pvc/name: iomesh-localpv-hostpath-pvc
            csi.storage.k8s.io/pvc/namespace: default
            enableQuota: "false"
            nodeID: iomesh-k8s-0
            quotaProjectID: "0"
            storage.kubernetes.io/csiProvisionerIdentity: 1675327643130-8081-com.iomesh.localpv-manager
            volumeType: hostpath
            volumeHandle: pvc-ab61547e-1d81-4086-b4e4-632a08c6537b
        nodeAffinity:
            required:
            nodeSelectorTerms:
            - matchExpressions:
                - key: topology.iomesh-localpv-manager.csi/node
                operator: In
                values:
                - iomesh-k8s-0
        ...
        ```

        | Field | Description  |
        | -------- | ------ |
        | `spec.csi.volumeAttributes.basePath` | `basePath` created by the IOMesh local PV. Taking the above YAMl config as an example, the directory for the PV is created on  `/var/iomesh/local/pvc-ab61547e-1d81-4086-b4e4-632a08c6537b` on the node `iomesh-k8s-0`. |
        | `spec.nodeAffinity`| PV node affinity. This PV will be bound to the specified node once created and will not move to another node.|  

### Enable Capacity Limit

In the above example, an IOMesh local PV with a capacity of 2G is created, corresponding to a directory on the node. By default, there is no limit on the amount of data written to this directory, allowing more than 2G to be written. However, if you have capacity isolation requirements, you can enable the capacity limit for this IOMesh local PV.

**Prerequisite**

The capacity limit feature is implemented on the `xfs_quota` tool. Once enabled, a local PV will be created with `xfs quota` configured to ensure that the capacity size declared in the PVC is true.

**Procedure**

The following example assumes IOMesh local PV is created on the `/var/iomesh/localpv-quota` directory, and the disk path is `/dev/sdx`. 

1. Create a directory `/var/iomesh/localpv-quota` as `basePath`.

    ```shell
    mkdir -p /var/iomesh/localpv-quota
    ```
2. Format the filesystem of the disk as `xfs`. The disk path is `/dev/sdx`.

    ```shell
    sudo mkfs.xfs /dev/sdx 
    ```
3. Mount the disk to the `/var/iomesh/localpv-quota` directory and enable XFS `prjquota` via the mount option.

    ```shell
    mount -o prjquota /dev/sdx /var/iomesh/localpv-quota
    ```
    > _NOTE_: If you want to use an existing XFS mount point as the basePath, run the command `umount /dev/sdx` first to unmount the mount point. Then remount it via the `prjquota` mount option.

    > _NOTE_: To prevent the loss of mount information after rebooting the node, you need to write the mount information to the `/etc/fstab` configuration file. 

4. Create a StorageClass using this mount point as `basePath`. Set the field `parameters.enableQuota` to `true`.

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: iomesh-localpv-manager-hostpath
    parameters:
    volumeType: hostpath
    basePath: /var/iomesh/localpv-quota
    enableQuota: "false" # Set it to true.
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
5. Create a PVC using the StorageClass created in Step 4.

    > _NOTE_: Scheduler is currently not supported in this release. The pod may be scheduled to a node with insufficient capacity. You should manually modify node affinity for this pod so that it can be rescheduled to a proper node. For modification procedure, refer to [Kubernetes Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/).

##  IOMesh Device Local PV

IOMesh Device Local PV supports creating local PVs based on a block device on the node for pod use.

### Create IOMesh Device LocalPV

**Procedure**

1. When IOMesh LocalPV Manager is deployed, a default StorageClass will be created as shown below with `volumeType` set to `device`. 

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: iomesh-localpv-manager-device
    parameters:
    volumeType: device
    csi.storage.k8s.io/fstype: "ext4"
    deviceSelector: {}
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
    | Field  | Description   |
    | -------- | ----------- |
    | `parameters.volumeType`     | Local PV type, either `hostpath` or `device`. Set the field to `device` for the IOMesh Device local PV.
    | `parameters.deviceSelector` | Device selector that filters block devices by label. If this field is not specified, then all labels will be filtered by default.|
    | `parameters.csi.storage.k8s.io/fstype ` | The filesystem type when the `volumeMode` is set to `Filesystem`, which defaults to `ext4`. |
    | `volumeBindingMode` | Volume binding mode, which only supports `WaitForFirstConsumer`. |

2. Configure `deviceSelector`. The way to configure `deviceSelector` is much like what has been introduced in [`labelSelector`](../deploy-iomesh-cluster/setup-iomesh.md). You can also refer to [Kubernetes Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/).

    For example, `iomesh.com/bd-driveType: SSD` means the StorageClass will only filter SSD for creating local PVs.

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: iomesh-localpv-manager-device-ssd
    parameters:
    volumeType: device
    deviceSelector: |
        matchLabels:
        iomesh.com/bd-driveType: SSD
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
    > _NOTE_: Kubernetes only supports one-level key/value nesting when configuring `parameters` in the StorageClass , so you should add `|` to the `deviceSelector` field to identify the subsequent content as a multi-line string.

3. Create a PVC using the default StorageClass.

    > _NOTE_: To ensure successful creation, make sure that each Kubernetes worker node has at least 1 available raw block device with a capacity larger than 10 G and has no filesystem specified.

    - Create a YAML config `iomesh-localpv-device-pvc.yaml` with the following content. Configure `volumeMode`, and setting this field to `filesystem` or `block` depends on the need of formatting the filesystem.

        - `Filesystem`: The block device will be formatted as the filesystem specified in the `parameters.fsType` field of the StorageClass and mounted to the pod after the pod is bound to this PVC.
        - `Block`: The block device can only be mounted by a pod. It does not require formatting the filesystem and can be used directly by applications. 

            ```yaml
            kind: PersistentVolumeClaim
            apiVersion: v1
            metadata:
            name: iomesh-localpv-device-pvc
            spec:
            storageClassName: iomesh-localpv-manager-device
            accessModes:
                - ReadWriteOnce
            resources:
                requests:
                storage: 10G
            volumeMode: "" # Specify the volume mode.
            ```

    - Apply the YAML config to create the PVC.
        ```shell
        kubectl apply -f iomesh-localpv-device-pvc.yaml
        ```

    - View the PVC status.
        ```shell
        kubectl get pvc iomesh-localpv-device-pvc
        ```
        You will see the PVC in the `Pending` state because `volumeBindingMode` in its StorageClass has been configured as `WaitForFirstConsumer`. When this PVC is bound to a pod, the corresponding PV will be created on the node where the pod resides, and at this time, the PVC will be in the `Bound` state.

        ```output
        NAME                          STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS               AGE
        iomesh-localpv-device-pvc     Pending                                      localpv-manager-device     1m12s
        ```

4. Create a pod and bind it to the PVC created in Step 3.

    - Create a YAML config `iomesh-localpv-device-pod.yaml` with the following content, which will mount the PV to the `/mnt/iomesh/localpv` directory.
        ```yaml
        apiVersion: v1
        kind: Pod
        metadata:
        name: iomesh-localpv-device-pod
        spec:
        volumes:
        - name: iomesh-localpv-device
            persistentVolumeClaim:
            claimName: iomesh-localpv-device-pvc
        containers:
        - name: busybox
            image: busybox
            command:
            - sh
            - -c
            - 'while true; do sleep 30; done;'
            volumeMounts:
            - mountPath: /mnt/iomesh/localpv # The directory to mount the PV.
            name: iomesh-localpv-device
        ```
   - Apply the YAML config to create the pod.
        ```shell
        kubectl apply -f iomesh-localpv-device-pod.yaml
        ```

   - Verify that the pod is in `Running` state.

        ```shell
        kubectl get pod iomesh-localpv-device-pod
        ```
        > _NOTE_: Scheduler currently is not supported in this release. The pod may be scheduled to a node that does not have available block devices. You should manually edit node affinity for this pod to reschedule it to a proper node. For modification procedure, refer to [Kubernetes Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/).

   - Verify that the PVC is in `Bound` state.
        ```shell
        kubectl get pvc iomesh-localpv-device-pvc
        ```
     If successful, you should see the PVC is in `Bound` state, and the PV was created.
        ```shell
        NAME                          STATUS   VOLUME                                     CAPACITY   ACCESS MODES     
        iomesh-localpv-device-pvc     Bound    pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4   10G         RWO           
        ```
5.  Check the status of the block device that should be in `Bound` state.

    ```shell
    kubectl  get blockdevice --namespace iomesh-system -o wide
    ```
    IOMesh LocalPV Manager selects a block device based on 2 requirements: 1. Its capacity must exceed that of the PVC; 2. Its capacity must be closest to that of the PVC among all available block devices. For instance, if a 10-GB PVC is declared and there are 3 block devices `BlockDevice-A` with 9 GB, `BlockDevice-B` with 15 GB, and `BlockDevice-C` with 20GB. `BlockDevice-A` will be discarded due to its limited capacity, and `BlockDevice-B`, which has a capacity closer to 10 GB than `BlockDevice-C`, is finally selected for binding.

6. View the configurations of this PV. Replace `pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4` with the PV name obtained in Step 4.

    ```shell
    kubeclt get pv pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4 -o yaml
    ```

    ```yaml
    apiVersion: v1
    kind: PersistentVolume
    metadata:
    ...
    spec:
    ...
    csi:
        driver: com.iomesh.iomesh-localpv-manager
        volumeAttributes:
        csi.storage.k8s.io/pv/name: pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4
        csi.storage.k8s.io/pvc/name: iomesh-localpv-device-pvc
        csi.storage.k8s.io/pvc/namespace: default
        nodeID: ziyin-k8s-2
        quotaProjectID: "0"
        storage.kubernetes.io/csiProvisionerIdentity: 1675327673777-8081-com.iomesh.localpv-manager
        volumeType: device
        volumeHandle: pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4
    nodeAffinity:
        required:
        nodeSelectorTerms:
        - matchExpressions:
            - key: topology.iomesh-localpv-manager.csi/node
            operator: In
            values:
            - ziyin-k8s-2
    ...
    ```

    | Field  | Description    |
    | ----- | ------- |
    | `spec.csi.volumeAttributes.volumeHandle` | The unique identifier of the BlockDeviceClaim.|
    | `spec.nodeAffinity` | PV node affinity. The PV will be bound to the specified node once created and will not move to another node. |

