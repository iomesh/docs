---
id: localpv-manager
title: IOMesh LocalPV Manager
sidebar_label: IOMesh LocalPV Manager
---

## Introduction

### What is IOMesh LocalPV Manager

IOMesh LocalPV Manager is a CSI driver for managing local storage on Kubernetes worker nodes. You can create local PVs using a directory or block device on the node for pod use.

IOMesh LocalPV has the following advantages compared to [Kubernetes HostPath Volume](https://kubernetes.io/docs/concepts/storage/volumes/#hostpath) and [Kubernetes native local PV](https://kubernetes.io/docs/concepts/storage/volumes/#local):

- Dynamically provision PVs to allow flexible node storage access through StorageClass and PVC without the need for administrators to pre-provision static PVs. 

- Create PVs using a directory or block device, offering more flexibility compared to Kubernetes local PVs that are limited to the directory.

- Enable capacity limit for Hostpath Local PV to implement isolation.


### Architecture

![IOMesh LocalPV Manager](https://user-images.githubusercontent.com/12667277/217775597-7261e106-1407-4adf-92df-a1c99e447273.svg)

IOMesh LocalPV Manager is comprised of components: Controller Driver, Node Driver, and Node Disk Manager.

**Controller Driver** 

The controller driver consists of multiple instances on all worker nodes and is implemented on the standard CSI controller server. Its responsibility is to create or remove local PVs and map them to local directories or block devices.

**Node Driver** 

The node driver comprises multiple instances on all worker nodes and it is implemented using the standard CSI Node Server. Its main task is to interact with kubelet to mount and format local PVs.

**Node Disk Manager**

`Node Disk Manager` is responsible for discovering node block devices and abstract block devices into BlockDevice objects, providing a BlockDeviceClaim mechanism to ensure that a block device is exclusive to a particular Pod.

## Deployment

IOMesh LocalPV Manager will be automatically installed when installing IOMesh. To see the status of the IOMesh LocalPV Manager pod, run the following command:

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

When selecting local PV type for your applications or databases, consider whether they require exclusive use of a disk or the ability to mount a raw block device. If so, select the IOMesh Device local PV. However, if this is not a requirement, choose the IOMesh Hostpath local PV instead. 

IOMesh Hostpath LocalPV allows Kubernetes PVs to be created based on a directory on a node to be made available to Pods, and supports PV-level capacity limits.

### Create IOMesh Hostpath Local PV

1. Create a StorageClass with the following content and configure `basePath` and `enableQuota` if needed. You may also use the default StorageClass created when IOMesh LocalPV Manager is deployed. 

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: iomesh-localpv-manager-hostpath
      parameters:
    volumeType: hostpath
    basePath: /var/iomesh/local
    enableQuota: "false"
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
    | Field | Description  |
    | ------- | ---- |
    | `parameters.volumeType`  | Local PV type, either `hostpath` or `device`.                    |
    | `parameters.basePath`    | The directory specified in `parameters.basePath`, on which local PV will created. If `parameters.basePath` is not specified, the system will create a directory by default. Note that the value for `parameters.basePath` must be a fullpath. |
    | `parameters.enableQuota` | Shows whether capacity limit is enabled for this local PV.                                    |
    | [`volumeBindingMode`](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode)    | Volume binding mode, which only supports `WaitForFirstConsumer`.| 

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
3. Create a pod and bind it to the PVC created in the previous step.

    - Create a YAML config `iomesh-localpv-hostpath-pod.yaml` with the following content. 
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

    - Get the YAML config to see the PV configurations. Note that the PV name is obtained in the previous step. 
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
        | `spec.csi.volumeAttributes.basePath` | `basePath` created by IOMesh local PV. The directory for this PV is created under `/var/iomesh/local/pvc-ab61547e-1d81-4086-b4e4-632a08c6537b` on the node `iomesh-k8s-0`. |
        | `spec.nodeAffinity`| PV node affinity. Once created, this PV will be bound to the specified node and will not move to another node.|      

### Enable Capacity Limit

In the above example, an IOMesh local PV is created with a capacity of 2 G, corresponding to a directory on the node, and by default does not limit the amount of data written into this directory, allowing for more than written data of over 2 G. However, if you have requirement for capacity isolation, you may enable capacity limit for this IOMesh local PV.

**Prerequisite**

Capacity limit is implemented on the XFS file system `xfs_quota`. Once enabled, a local PV will be created with `xfs quota` configured to ensure that the capacity size declared in the PVC is true.

**Procedure**

1. Create a directory `/var/iomesh/localpv-quota` as `basePath`.

    ```shell
    mkdir -p /var/iomesh/localpv-quota
    ```
2. Format the file system of the disk to be mounted as `xfs`. This example assumes the disk is `/dev/sdx`.

    ```shell
    sudo mkfs.xfs /dev/sdx
    ```
3. Mount the disk to the basePath `/var/iomesh/localpv-quota` and enable XFS `prjquota` via the mountoption.(mountoption)

    ```shell
    mount -o prjquota /dev/sdx /var/iomesh/localpv-quota
    ```
    > _NOTE_: XFS `prjquota` (等子银补充)

    > _NOTE_: To prevent the loss of mount information after reboot the node, you need to write the mount information to the `/etc/fstab` configuration file. 

4. Create a StorageClass using this mount point as `basePath`. Set the field `parameters.enableQuota` to `true`.

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: iomesh-localpv-manager-hostpath
    parameters:
    volumeType: hostpath
    basePath: /var/iomesh/localpv-quota
    enableQuota: "true"
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
5. Create a PVC using the StorageClass created in the previous step.

    > _NOTE_: Scheduler is currently not supported in this release. The pod may be scheduled to a node with insufficient capacity. You should manually modify node affinity for this pod so that it can be rescheduled to a node.

##  IOMesh Device LocalPV

IOMesh Device LocalPV supports creating local PVs based on a block device on the node for pod use.

### Create IOMesh Device LocalPV

**Procedure**

1. A default StorageClass will be created when IOMesh LOcalPV Manager is deployed as shown below, with its volume type as `device`. 

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
    | `parameters.volumeType`     | Local PV volume type, either `hostpath` or `device`.              |
    | `parameters.deviceSelector` | Device selector that filters block devices by label.|
    | `parameters.csi.storage.k8s.io/fstype ` | The file system type when the `volumeMode` is `Filesystem`, which defaults to `ext4`. |
    | `volumeBindingMode` | The volume binding mode, which only supports `WaitForFirstConsumer`. |

2. Configure `deviceSelector`.


3. Create a PVC.

    > _NOTE_: To ensure that the PVC is created successfully, make sure that each K8s worker has at least one free bare block device larger than 10G that is not assigned any file system. 

    - Create a YAML config `iomesh-localpv-device-pvc.yaml` with the following content. Note that the default StorageClass is specified in it.

        - `Filesystem`: Volumes can be mounted by multiple Pods and need to be formatted for the file system in a format specified in  before they can be used
        - `Block`: Volumes can only be mounted by a Pod, it does not require file system formatting and can be used directly by the application. Therefore, the decision on which volume type to choose should be based on the needs of the application.

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

    - Create a YAML config `iomesh-localpv-device-pod.yaml` with the following content. 
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
            - mountPath: /mnt/iomesh/localpv # The path to mount the PV.
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
        > _NOTE_: Scheduler currently is not supported in this release. The pod may be scheduled to a node that does not have available block devices. You should manually edit node affinity for this pod to reschedule it to a proper node. (需要补充手动修改步骤)

   - Verify that the PVC is in `Bound` state.
        ```shell
        kubectl get pvc iomesh-localpv-device-pvc
        ```
     If successful, you should see the PVC is in `Bound` state, and the PV was created.
        ```shell
        NAME                          STATUS   VOLUME                                     CAPACITY   ACCESS MODES     
        iomesh-localpv-device-pvc     Bound    pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4   10G         RWO           
        ```
5.  Check the block device status.

    ```shell
    kubectl  get blockdevice --namespace iomesh-system -o wide
    ```
    You should see the block device is in `bound` state.  
    可以看到对应的块设备已进入 bound 状态。IOMesh LocalPV Manager 会选择大于且最接近与 PVC 大小的块设备进行绑定，比如在这个例子是，PVC 声明的大小是 10GB，假设存在三个空闲块设备 BlockDevice-A(9GB)，BlockDevice-B(15GB)，BlockDevice-C(20GB)，BlockDevice-A 由于不满足容量需求被淘汰，BlockDevice-B 比 BlockDevice-C 的大小更接近 10GB，最终 BlockDevice-B 被绑定.

6. View the configurations of this PV. The PV name is obtained in Step 4.

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
    | `spec.nodeAffinity` | PV node affinity. Once created, this PV will be bound to the specified node and will not move to another node. |

